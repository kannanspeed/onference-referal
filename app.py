import os
from flask import Flask, render_template, redirect, url_for, flash, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import secrets

# Initialize app
app = Flask(__name__, 
            template_folder='referral_app/templates',
            static_folder='referral_app/static')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(16))
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///referral_app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db = SQLAlchemy(app)

# Initialize login manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Define models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    referral_code = db.Column(db.String(10), unique=True, nullable=False)
    referred_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship for referrals
    referrals = db.relationship('User', backref=db.backref('referrer', remote_side=[id]))
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def generate_referral_code(self):
        self.referral_code = secrets.token_urlsafe(8)[:8]

class Referral(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    referrer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    referred_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, completed, rewarded
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    referrer = db.relationship('User', foreign_keys=[referrer_id])
    referred = db.relationship('User', foreign_keys=[referred_id])

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Create database tables
def create_tables():
    with app.app_context():
        db.create_all()

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        referral_code = request.form.get('referral_code')
        
        # Check if user already exists
        user_exists = User.query.filter((User.username == username) | (User.email == email)).first()
        if user_exists:
            flash('Username or email already exists.')
            return redirect(url_for('register'))
        
        # Create new user
        new_user = User(username=username, email=email)
        new_user.set_password(password)
        new_user.generate_referral_code()
        
        # Save user first to get an ID
        db.session.add(new_user)
        db.session.commit()
        
        # Check if referred by someone and create referral record AFTER the user has an ID
        if referral_code:
            referrer = User.query.filter_by(referral_code=referral_code).first()
            if referrer:
                # Update user with referrer information
                new_user.referred_by = referrer.id
                
                # Create referral record with valid IDs
                new_referral = Referral(
                    referrer_id=referrer.id, 
                    referred_id=new_user.id,
                    status='pending'
                )
                db.session.add(new_referral)
                db.session.commit()
        
        flash('Account created successfully!')
        return redirect(url_for('login'))
    
    # Check for referral code in URL parameters
    referral_code = request.args.get('ref', '')
    
    return render_template('register.html', referral_code=referral_code)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('dashboard'))
        
        flash('Invalid email or password.')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    # Get user's referrals from both the User model and Referral model
    user_referrals = User.query.filter_by(referred_by=current_user.id).all()
    
    # Get referrals from the Referral model where current user is the referrer
    referral_records = Referral.query.filter_by(referrer_id=current_user.id).all()
    
    # Count pending and completed referrals
    pending_count = sum(1 for r in referral_records if r.status == 'pending')
    completed_count = sum(1 for r in referral_records if r.status == 'completed')
    
    # Calculate total rewards (example: $5 per completed referral)
    total_rewards = completed_count * 5  # $5 per completed referral
    
    return render_template(
        'dashboard.html', 
        referrals=user_referrals,
        referral_records=referral_records,
        pending_count=pending_count,
        completed_count=completed_count,
        total_rewards=total_rewards
    )

@app.route('/profile')
@login_required
def profile():
    # Get referrals
    referrals = User.query.filter_by(referred_by=current_user.id).all()
    
    # Get referrer if any
    referrer = None
    if current_user.referred_by:
        referrer = User.query.get(current_user.referred_by)
        
    return render_template('profile.html', referrals=referrals, referrer=referrer)

@app.route('/update_referral_status/<int:referral_id>', methods=['POST'])
@login_required
def update_referral_status(referral_id):
    # Only allow admins or the referrer to update the status
    referral = Referral.query.get_or_404(referral_id)
    
    if current_user.id != referral.referrer_id:
        flash('You do not have permission to update this referral.')
        return redirect(url_for('dashboard'))
    
    new_status = request.form.get('status')
    if new_status in ['pending', 'completed', 'rewarded']:
        referral.status = new_status
        db.session.commit()
        flash('Referral status updated successfully!')
    else:
        flash('Invalid status provided.')
        
    return redirect(url_for('dashboard'))

if __name__ == '__main__':
    create_tables()  # Create tables before running the app
    app.run(debug=True, port=5001)  # Using port 5001 instead of default 5000 