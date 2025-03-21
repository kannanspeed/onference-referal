/**
 * ReferralPro - Main JavaScript
 * Handles UI interactions, animations, and form validation
 */

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const navbarToggler = document.getElementById('navbarToggler');
    const navbarMenu = document.getElementById('navbarMenu');
    
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function() {
            navbarMenu.classList.toggle('active');
        });
    }
    
    // Close flash messages
    const closeFlashBtns = document.querySelectorAll('.close-flash');
    closeFlashBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const flashMessage = this.parentElement;
            flashMessage.style.opacity = '0';
            setTimeout(() => {
                flashMessage.remove();
            }, 300);
        });
    });
    
    // Copy to clipboard functionality
    const copyCodeBtn = document.getElementById('copyCode');
    if (copyCodeBtn) {
        copyCodeBtn.addEventListener('click', function() {
            const referralLinkElement = document.getElementById('referralLink');
            if (!referralLinkElement) return; // Exit if element doesn't exist
            
            const referralLink = referralLinkElement.textContent;
            
            // Try using the Clipboard API first
            if (navigator.clipboard) {
                navigator.clipboard.writeText(referralLink)
                    .then(function() {
                        const copyMessage = document.getElementById('copyMessage');
                        if (copyMessage) {
                            copyMessage.classList.add('active');
                            setTimeout(() => {
                                copyMessage.classList.remove('active');
                            }, 2000);
                        }
                    })
                    .catch(function(err) {
                        console.error('Could not copy text: ', err);
                        fallbackCopyTextToClipboard(referralLink);
                    });
            } else {
                // Fall back to older method
                fallbackCopyTextToClipboard(referralLink);
            }
        });
    }
    
    // Fallback copy method
    function fallbackCopyTextToClipboard(text) {
        const tempInput = document.createElement('input');
        tempInput.style.position = 'absolute';
        tempInput.style.left = '-9999px';
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        
        try {
            document.execCommand('copy');
            const copyMessage = document.getElementById('copyMessage');
            if (copyMessage) {
                copyMessage.classList.add('active');
                setTimeout(() => {
                    copyMessage.classList.remove('active');
                }, 2000);
            }
        } catch (err) {
            console.error('Failed to copy: ', err);
            alert('Could not copy automatically. Please select and copy the link manually: ' + text);
        }
        
        document.body.removeChild(tempInput);
    }
    
    // Form validation for login form
    const loginForm = document.querySelector('form.auth-form[action*="login"]');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            const emailInput = this.querySelector('input[name="email"]');
            const passwordInput = this.querySelector('input[name="password"]');
            let isValid = true;
            
            // Simple email validation
            if (!emailInput.value || !emailInput.value.includes('@')) {
                markInvalid(emailInput, 'Please enter a valid email address');
                isValid = false;
            } else {
                markValid(emailInput);
            }
            
            // Password validation
            if (!passwordInput.value) {
                markInvalid(passwordInput, 'Please enter your password');
                isValid = false;
            } else {
                markValid(passwordInput);
            }
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    }
    
    // Form validation for registration form
    const registerForm = document.querySelector('form.auth-form[action*="register"]');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            const usernameInput = this.querySelector('input[name="username"]');
            const emailInput = this.querySelector('input[name="email"]');
            const passwordInput = this.querySelector('input[name="password"]');
            const agreeTerms = this.querySelector('input[name="agree_terms"]');
            let isValid = true;
            
            // Username validation
            if (!usernameInput.value || usernameInput.value.length < 3) {
                markInvalid(usernameInput, 'Username must be at least 3 characters long');
                isValid = false;
            } else {
                markValid(usernameInput);
            }
            
            // Email validation
            if (!emailInput.value || !emailInput.value.includes('@')) {
                markInvalid(emailInput, 'Please enter a valid email address');
                isValid = false;
            } else {
                markValid(emailInput);
            }
            
            // Password validation
            if (!passwordInput.value || passwordInput.value.length < 8) {
                markInvalid(passwordInput, 'Password must be at least 8 characters long');
                isValid = false;
            } else {
                markValid(passwordInput);
            }
            
            // Terms agreement validation
            if (!agreeTerms.checked) {
                const termsWrapper = agreeTerms.closest('.checkbox-wrapper');
                if (termsWrapper) {
                    termsWrapper.style.color = 'var(--danger-color)';
                }
                isValid = false;
            }
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    }
    
    // Add animation to sections when they scroll into view
    const animateSections = document.querySelectorAll('.feature-card, .step, .section-header');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated', 'fadeInUp');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        animateSections.forEach(section => {
            observer.observe(section);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        animateSections.forEach(section => {
            section.classList.add('animated', 'fadeInUp');
        });
    }
    
    // Add hover effects for buttons and cards
    const hoverElements = document.querySelectorAll('.btn, .feature-card, .overview-card');
    
    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
});

// Helper functions for form validation
function markInvalid(inputElement, message) {
    const inputGroup = inputElement.closest('.input-group');
    if (inputGroup) {
        inputGroup.style.borderColor = 'var(--danger-color)';
        
        // Create or update error message
        let errorMsg = inputGroup.nextElementSibling;
        if (!errorMsg || !errorMsg.classList.contains('error-message')) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            inputGroup.parentNode.insertBefore(errorMsg, inputGroup.nextSibling);
        }
        
        errorMsg.textContent = message;
        errorMsg.style.color = 'var(--danger-color)';
        errorMsg.style.fontSize = '0.75rem';
        errorMsg.style.marginTop = '0.25rem';
    }
}

function markValid(inputElement) {
    const inputGroup = inputElement.closest('.input-group');
    if (inputGroup) {
        inputGroup.style.borderColor = 'var(--border-color)';
        
        // Remove error message if exists
        const errorMsg = inputGroup.nextElementSibling;
        if (errorMsg && errorMsg.classList.contains('error-message')) {
            errorMsg.remove();
        }
    }
}

// Social sharing functionality
document.addEventListener('DOMContentLoaded', function() {
    // Social sharing buttons
    const emailShareBtn = document.querySelector('.email-share');
    const facebookShareBtn = document.querySelector('.facebook-share');
    const twitterShareBtn = document.querySelector('.twitter-share');
    const whatsappShareBtn = document.querySelector('.whatsapp-share');
    
    // Function to get the referral link
    function getReferralLink() {
        const referralLinkElement = document.getElementById('referralLink');
        return referralLinkElement ? referralLinkElement.textContent.trim() : '';
    }
    
    if (emailShareBtn) {
        emailShareBtn.addEventListener('click', function() {
            const referralLink = getReferralLink();
            if (!referralLink) return;
            
            const subject = 'Join Onference with my Personal Invitation!';
            const body = `Hey there!

I wanted to personally invite you to join Onference's amazing platform. 

Why you'll love it:
• Fast and easy signup process
• Earn rewards together
• Access to exclusive features and content
• Great user community

Just click the link below to get started:
${referralLink}

Looking forward to connecting with you there!

Cheers,
${document.querySelector('.dashboard-header h1')?.textContent.replace('Welcome, ', '').replace('!', '') || 'Your friend'}`;
            window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        });
    }
    
    if (facebookShareBtn) {
        facebookShareBtn.addEventListener('click', function() {
            const referralLink = getReferralLink();
            if (!referralLink) return;
            
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
        });
    }
    
    if (twitterShareBtn) {
        twitterShareBtn.addEventListener('click', function() {
            const referralLink = getReferralLink();
            if (!referralLink) return;
            
            const text = `I've just joined Onference and I'm loving it! Join me using my personal invitation link and we'll both get amazing rewards! #Onference #Referral`;
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`, '_blank');
        });
    }
    
    if (whatsappShareBtn) {
        whatsappShareBtn.addEventListener('click', function() {
            const referralLink = getReferralLink();
            if (!referralLink) return;
            
            const text = `🎁 *Join Onference's Exclusive Referral Program!* 🎁\n\nHey there! I'm inviting you to join Onference's amazing platform. \n\n✨ *Why Join?* ✨\n• Fast and easy signup process\n• Great rewards for both of us\n• Access to exclusive features\n\nUse my personal invitation link to get started: ${referralLink}\n\nLooking forward to seeing you there! 🚀`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        });
    }
});

// Copy referral link in profile page
const copyLinkBtn = document.getElementById('copyLink');
if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', function() {
        const referralLink = document.getElementById('referralLink').textContent;
        navigator.clipboard.writeText(referralLink).then(function() {
            // Visual feedback
            copyLinkBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                copyLinkBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        }).catch(function() {
            // Fallback for browsers that don't support clipboard API
            const tempInput = document.createElement('input');
            tempInput.value = referralLink;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            
            // Visual feedback
            copyLinkBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                copyLinkBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        });
    });
} 