# Referral App

A modern Python-based web application for managing referrals with a sleek UI and smooth animations.

## Features

- User registration and authentication
- Unique referral code generation for each user
- Referral tracking and management
- Modern UI with smooth animations and transitions
- User dashboard with referral statistics
- Responsive design for mobile and desktop

## Technology Stack

- **Backend**: Flask (Python)
- **Database**: SQLAlchemy with SQLite (configurable for PostgreSQL in production)
- **Frontend**: HTML5, CSS3 with animations, JavaScript
- **Authentication**: Flask-Login
- **Forms**: Flask-WTF

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd referral_app
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Set up environment variables (optional):
   ```
   export SECRET_KEY=your_secret_key
   export DATABASE_URL=your_database_url  # For production
   ```

6. Run the application:
   ```
   python app.py
   ```

7. Access the application at http://localhost:5000

## Usage

1. Register for an account
2. Share your unique referral code with friends
3. Track your referrals and rewards in the dashboard
4. View detailed statistics about your referral performance

## Project Structure

```
referral_app/
├── app.py                 # Main application file
├── requirements.txt       # Python dependencies
├── static/                # Static assets
│   ├── css/               # CSS stylesheets
│   ├── js/                # JavaScript files
│   └── images/            # Image assets
├── templates/             # HTML templates
│   ├── index.html         # Landing page
│   ├── login.html         # Login page
│   ├── register.html      # Registration page
│   ├── dashboard.html     # User dashboard
│   └── ...                # Other templates
└── models/                # Database models
```

## License

MIT 