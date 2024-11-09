/**
 * Signup Page Component
 * Features:
 * - Google Sign Up integration
 * - First name and Last name fields
 * - Email field
 * - Phone number with country code
 * - Password field with visibility toggle
 * - Terms and Privacy Policy links
 * - Login link for existing users
 * - Responsive design
 */

// React core imports
import React, { useState, useEffect } from 'react';

// Styles
import './Signup.css';

// SVG icons as React components
import { ReactComponent as GoogleIcon } from '../../assets/icons/google.svg';  // Google icon for OAuth button
import { ReactComponent as EyeIcon } from '../../assets/icons/eye.svg';       // Eye icon for password visibility toggle

// Static assets
import feedoLogo from '../../assets/images/feedo-logo.png';    // Feedo company logo
import awardBadge from '../../assets/images/award-badge.png';  // Award badge image for testimonials

// Routing
import { Link, useNavigate } from 'react-router-dom';  // React Router components for navigation

// Firebase imports
import { auth, db } from '../../../firebase/config';  // Firebase authentication and database instances

// Firebase authentication methods
import { 
    createUserWithEmailAndPassword,  // Email/password signup
    signInWithPopup,                 // OAuth popup handler
    GoogleAuthProvider,              // Google authentication provider
    updateProfile                    // User profile updater
} from 'firebase/auth';

// Firestore database methods
import { 
    doc,      // Document reference creator
    setDoc,   // Document setter
    getDoc    // Document getter
} from 'firebase/firestore';

// Add AuthContext import
import { useAuth } from '../../../auth/AuthContext';

// Helper function to generate a unique user ID from first and last name
// Parameters:
// - firstName: User's first name
// - lastName: User's last name
// - randomSuffix: Boolean to determine if a random suffix should be added (default: true)
// Returns: A lowercase, hyphenated string with optional random suffix
const createCustomUserId = (firstName, lastName, randomSuffix = true) => {
  // Convert to lowercase and remove special characters
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Create base ID
  let customId = `${cleanFirst}-${cleanLast}`;
  
  // Add random suffix for uniqueness if requested
  if (randomSuffix) {
    const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp
    const random = Math.random().toString(36).substring(2, 6); // 4 random alphanumeric characters
    customId += `-${timestamp}${random}`;
  }
  
  return customId;
};

const Signup = () => {
  // Add useAuth hook
  const { signup, googleSignIn, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Form state management
  // Stores user input for registration fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });

  // UI state management
  const [showPassword, setShowPassword] = useState(false);  // Toggle password visibility
  const [countryCode, setCountryCode] = useState('+44');   // Phone country code
  const [currentTestimonial, setCurrentTestimonial] = useState(0);  // Current testimonial index
  const [isSliding, setIsSliding] = useState(false);       // Testimonial slide animation state
  const [errors, setErrors] = useState({});                // Form validation errors
  const [isLoading, setIsLoading] = useState(false);       // Loading state for async operations
  const [isSignupActive, setIsSignupActive] = useState(true);  // Toggle between signup/login views

  // Testimonials data array
  // Each testimonial contains quote, author details, and profile image
  const testimonials = [
    {
      quote: "You made it so simple. My new site is so much faster and easier to work with than my old site. I just choose the page, make the change.",
      author: "Leslie Alexander",
      role: "Freelance React Developer",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      quote: "The platform is incredibly easy to use. I can now manage my website content without any technical knowledge.",
      author: "Sarah Johnson",
      role: "Digital Marketing Manager",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
      quote: "Outstanding platform! It has streamlined our entire content management process.",
      author: "Michael Chen",
      role: "Product Manager",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop"
    },
    // Add more testimonials as needed
  ];

  // Form input change handler
  // Updates formData state when user types in any input field
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Form submission handler for email/password signup
  // Creates new user account in Firebase Auth and Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use AuthContext signup with displayName
      await signup(
        formData.email, 
        formData.password,
        {
          lastName: formData.lastName,
          firstName: formData.firstName,
          displayName: `${formData.firstName} ${formData.lastName}`,
          phoneNumber: `${countryCode}${formData.phoneNumber}`,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          isEmailVerified: false,
          status: 'active'
        }
      );
      
      // Navigate to profile type selection
      navigate('/profile-type', { replace: true });
      
    } catch (error) {
      console.error('Signup error:', error);
      // Handle specific Firebase errors
      const errorMessage = 
        error.code === 'auth/email-already-in-use' ? 'This email is already registered. Please login instead.' :
        error.code === 'auth/invalid-email' ? 'Please enter a valid email address.' :
        error.code === 'auth/weak-password' ? 'Password should be at least 6 characters long.' :
        'Failed to sign up. Please try again.';
      
      setErrors({
        submit: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign Up handler
  // Manages Google OAuth authentication and user document creation
  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setErrors({}); // Clear any previous errors
    
    try {
      // For Google signup, the displayName comes from Google profile
      const { isNewUser } = await googleSignIn(true);
      
      if (isNewUser) {
        // For new users, always go to profile type selection
        navigate('/profile-type', { replace: true });
      } else {
        // This shouldn't happen due to our AuthContext checks
        console.warn('User already exists - redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Google Sign Up error:', error);
      
      // Handle specific error cases
      if (error.message.includes('Account already exists')) {
        setErrors({
          submit: 'An account with this Google email already exists. Please use the login page.'
        });
        // Optional: Redirect to login after a delay
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      } else {
        setErrors({
          submit: error.message || 'Failed to sign up with Google. Please try again.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Testimonial navigation handlers
  // Manages testimonial carousel functionality
  const handleDotClick = (index) => {
    setIsSliding(true);
    setTimeout(() => {
      setCurrentTestimonial(index);
      setIsSliding(false);
    }, 500);
  };

  // Auto-rotate testimonials effect
  // Changes testimonial every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIsSliding(true);
      setTimeout(() => {
        setCurrentTestimonial((prev) => {
          const nextIndex = prev === testimonials.length - 1 ? 0 : prev + 1;
          setIsSliding(false);
          return nextIndex;
        });
      }, 500);
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  // Form validation function
  // Checks all required fields and format requirements
  // Returns boolean indicating if form is valid
  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!/^[a-zA-Z\s]{2,30}$/.test(formData.firstName.trim())) {
      newErrors.firstName = 'Please enter a valid first name (2-30 characters)';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!/^[a-zA-Z\s]{2,30}$/.test(formData.lastName.trim())) {
      newErrors.lastName = 'Please enter a valid last name (2-30 characters)';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    const phoneRegex = /^\d{10}$/;
    const cleanPhone = formData.phoneNumber.replace(/\D/g, '');
    if (!cleanPhone) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const strength = calculatePasswordStrength(formData.password);
      if (strength.score < 3) {
        newErrors.password = 'Please choose a stronger password';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Password strength calculator
  // Returns object with score (0-5) and strength label
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Contains number
    if (/\d/.test(password)) strength += 1;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;
    
    // Contains special character
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    
    return {
      score: strength,
      label: strength === 0 ? 'Very Weak' :
             strength === 1 ? 'Weak' :
             strength === 2 ? 'Fair' :
             strength === 3 ? 'Good' :
             strength === 4 ? 'Strong' : 'Very Strong'
    };
  };

  // Auth toggle handler
  // Manages transition between signup and login views
  const handleToggle = () => {
    setIsSignupActive(!isSignupActive);
    // Navigate to login page after a small delay for smooth transition
    if (isSignupActive) {
      setTimeout(() => {
        navigate('/login');
      }, 300);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-left">
        <img src={feedoLogo} alt="Feedo AI Logo" className="feedo-logo" />
        <div className="testimonial">
          <div className={`testimonial-content ${isSliding ? 'sliding-out' : ''}`}>
            <p className="quote">{testimonials[currentTestimonial].quote}</p>
            <div className="author">
              <img 
                src={testimonials[currentTestimonial].image}
                alt={testimonials[currentTestimonial].author}
                className="author-photo" 
              />
              <div className="author-info">
                <h4>{testimonials[currentTestimonial].author}</h4>
                <p>{testimonials[currentTestimonial].role}</p>
              </div>
            </div>
          </div>
          <div className="testimonial-dots">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentTestimonial ? 'active' : ''}`}
                onClick={() => handleDotClick(index)}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
        <div className="award-badges">
          <img src={awardBadge} alt="Award Badge" />
          <img src={awardBadge} alt="Award Badge" />
          <img src={awardBadge} alt="Award Badge" />
        </div>
      </div>

      <div className="signup-right">
        <div className="signup-form-container">
          <div className="auth-toggle">
            <button 
              className={`toggle-btn ${isSignupActive ? 'active' : ''}`}
              onClick={() => setIsSignupActive(true)}
            >
              Sign Up
            </button>
            <button 
              className={`toggle-btn ${!isSignupActive ? 'active' : ''}`}
              onClick={handleToggle}
            >
              Login
            </button>
            <div className={`slider ${isSignupActive ? 'left' : 'right'}`} />
          </div>

          <button 
            type="button"
            className={`google-signup-btn ${isLoading || authLoading ? 'loading' : ''}`}
            onClick={handleGoogleSignUp}
            disabled={isLoading || authLoading}
          >
            <GoogleIcon />
            {isLoading || authLoading ? 'Signing up...' : 'Sign up with Google'}
          </button>

          <div className="divider">
            <span>Or</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="name-fields">
              <div className="form-group">
                <label htmlFor="firstName">First name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone number</label>
              <div className="phone-input">
                <select 
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="country-code"
                >
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+86">🇨🇳 +86</option>
                  <option value="+81">🇯🇵 +81</option>
                  <option value="+49">🇩🇪 +49</option>
                  <option value="+33">🇫🇷 +33</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+971">🇦🇪 +971</option>
                  <option value="+92">🇵🇰 +92</option>
                </select>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="123-456-7890"
                  className={errors.phoneNumber ? 'error' : ''}
                />
                {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <EyeIcon />
                </button>
              </div>
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bars">
                    {[...Array(5)].map((_, index) => (
                      <div
                        key={index}
                        className={`strength-bar ${
                          index < calculatePasswordStrength(formData.password).score
                            ? calculatePasswordStrength(formData.password).label.toLowerCase()
                            : ''
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`strength-label ${calculatePasswordStrength(formData.password).label.toLowerCase()}`}>
                    {calculatePasswordStrength(formData.password).label}
                  </span>
                </div>
              )}
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <button 
              type="submit" 
              className={`create-account-btn ${isLoading || authLoading ? 'loading' : ''}`}
              disabled={isLoading || authLoading}
            >
              <span>{isLoading || authLoading ? '' : 'Create Account'}</span>
            </button>
            
            {errors.submit && (
              <div className="error-message submit-error">
                {errors.submit}
              </div>
            )}
          </form>

          <div className="terms">
            By signing up you agree to <a href="/terms">Terms and Conditions</a> & <a href="/privacy">Privacy Policy</a>
          </div>
        </div>

        <footer className="signup-footer">
          <div className="copyright">
            Copyright 2021 - 2022 Feedo Inc. All rights Reserved
          </div>
          <button className="help-btn">
            Need help?
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Signup;