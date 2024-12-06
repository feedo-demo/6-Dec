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
import './LoginSignup.css';

// SVG icons as React components
import { ReactComponent as GoogleIcon } from '../../../assets/icons/google.svg';  // Google icon for OAuth button
import { ReactComponent as EyeIcon } from '../../../assets/icons/eye.svg';       // Eye icon for password visibility toggle

// Static assets
import feedoLogo from '../../../assets/images/feedo-logo.png';    // Feedo company logo
import awardBadge from '../../../assets/images/award-badge.png';  // Award badge image for testimonials

// Routing
import { Link, useNavigate } from 'react-router-dom';  // React Router components for navigation

// Firebase imports
import { auth, db } from '../../../firebase/config';  // Firebase authentication and database instances

// Firebase authentication methods
import { 
    createUserWithEmailAndPassword,  // Email/password signup
    signInWithPopup,                 // OAuth popup handler
    GoogleAuthProvider,              // Google authentication provider
    updateProfile,                    // User profile updater
    sendPasswordResetEmail           // Password reset email sender
} from 'firebase/auth';

// Firestore database methods
import { 
    doc,      // Document reference creator
    setDoc,   // Document setter
    getDoc    // Document getter
} from 'firebase/firestore';

// Add AuthContext import
import { useAuth } from '../../../auth/AuthContext';

// Update imports
import { userOperations, createUserDataStructure } from '../../../auth/userManager';

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

import TwoFactorVerification from '../../../components/TwoFactorVerification/TwoFactorVerification';
import SocialLogin from '../../../components/SocialLogin/SocialLogin';
import AuthToggle from '../../../components/AuthToggle/AuthToggle';
import AuthButton from '../../../components/AuthButton/AuthButton';

import { validateUserData } from '../../../auth/validation';
import { AUTH_NOTIFICATIONS, handleAuthError } from '../../../components/Toast/toastnotifications';

import { useToast } from '../../../components/Toast/ToastContext';

import ForgotPassword from '../../components/ForgotPassword/ForgotPassword';

// Add import for password utilities
import { calculatePasswordStrength, isPasswordValid } from '../../../utils/passwordUtils';

const LoginSignup = () => {
  const { signup, login, googleSignIn, verifyTwoFactor } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Form state management
  // Stores user input for registration fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneCode: '+44',
    phoneNumber: '',
    password: '',
  });

  // UI state management
  const [showPassword, setShowPassword] = useState(false);  // Toggle password visibility
  const [currentTestimonial, setCurrentTestimonial] = useState(0);  // Current testimonial index
  const [isSliding, setIsSliding] = useState(false);       // Testimonial slide animation state
  const [errors, setErrors] = useState({});                // Form validation errors
  const [isLoading, setIsLoading] = useState(false);       // Loading state for async operations
  const [isSignupActive, setIsSignupActive] = useState(true);  // Toggle between signup/login views

  // Add login-specific state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showTwoFactorInput, setShowTwoFactorInput] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // Add these new state variables inside LoginSignup component
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setLoginData(prev => ({
        ...prev,
        email: rememberedEmail
      }));
      setRememberMe(true);
    }
  }, []);

  // Handle login form changes
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    
    try {
        const result = await login(loginData.email, loginData.password);
        
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', loginData.email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }
        
        if (result?.requiresTwoFactor) {
            setShowTwoFactorInput(true);
            return;
        }
        
        // Add a small delay to ensure smooth transition
        setTimeout(() => {
            if (result?.user?.isPending) {
                navigate('/profile-type', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        }, 500);

    } catch (error) {
        console.error('Login error:', error);
        const errorMessage = handleAuthError(error);
        // Only set the form error, remove the toast
        setErrors({ submit: errorMessage });
    } finally {
        setIsLoading(false);
    }
  };

  // Handle 2FA verification
  const handleTwoFactorSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({}); // Clear any previous errors
    
    try {
        const result = await verifyTwoFactor(twoFactorCode);
        
        // Navigate immediately on success
        if (result?.user?.isPending) {
            navigate('/profile-type', { replace: true });
        } else {
            navigate('/dashboard', { replace: true });
        }
    } catch (error) {
        console.error('2FA error:', error);
        setErrors({ twoFactor: AUTH_NOTIFICATIONS.LOGIN.INVALID_2FA });
    }
    // Always set loading to false after try/catch
    setIsLoading(false);
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await googleSignIn();
      
      // Add debug logging
      console.log('Google Sign In Result:', result);
      
      // Show success message for new users
      if (result?.isNewUser) {
        showToast('Account created successfully!', 'success');
      }
      
      // Navigate based on user state
      setTimeout(() => {
        if (result?.user?.isPending) {
          navigate('/profile-type', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }, 500);
      
    } catch (error) {
      console.error('Google sign in error:', error);
      const errorMessage = handleAuthError(error);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

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

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle signup form submission
  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Basic form validation
    const validationErrors = {};
    if (!formData.firstName.trim()) {
      validationErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      validationErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      validationErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = 'Please enter a valid email';
    }
    if (!formData.phoneNumber.trim()) {
      validationErrors.phoneNumber = 'Phone number is required';
    }

    // Validate password strength
    if (!isPasswordValid(formData.password)) {
      validationErrors.password = 'Password does not meet security requirements';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Create user with email and password
      const result = await signup(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneCode + formData.phoneNumber,
        displayName: `${formData.firstName} ${formData.lastName}`
      });

      if (result?.success) {
        showToast('Account created successfully!', 'success');
        navigate('/profile-type', { replace: true });
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = handleAuthError(error);
      setErrors({ submit: errorMessage });
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
    const errorMessages = [];
    
    // Email validation
    if (!validateUserData.email(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      errorMessages.push('Invalid email address');
    }
    
    // Password validation
    if (!validateUserData.password(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters long';
      errorMessages.push('Password must be at least 8 characters');
    }
    
    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      errorMessages.push('First name is required');
    } else if (!validateUserData.name(formData.firstName)) {
      newErrors.firstName = 'Please enter a valid first name (2-30 characters)';
      errorMessages.push('Invalid first name');
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      errorMessages.push('Last name is required');
    } else if (!validateUserData.name(formData.lastName)) {
      newErrors.lastName = 'Please enter a valid last name (2-30 characters)';
      errorMessages.push('Invalid last name');
    }
    
    // Phone validation
    if (!validateUserData.phone(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
      errorMessages.push('Invalid phone number');
    }
    
    setErrors(newErrors);
    
    // If there are errors, show them in a single toast
    if (errorMessages.length > 0) {
      showToast(`Please fix the following: ${errorMessages.join(', ')}`, 'error');
      return false;
    }
    
    return true;
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

  // Handle LinkedIn Sign Up
  const handleLinkedInSignUp = async () => {
    setIsLoading('linkedin');
    setErrors({});
    
    try {
      await loginWithPopup({
        connection: 'linkedin',
        prompt: 'login',
        scope: 'openid profile email'
      });
      // Auth0Callback component will handle the rest
    } catch (error) {
      console.error('LinkedIn Sign Up error:', error);
      setErrors({
        submit: error.message || 'Failed to sign up with LinkedIn. Please try again.'
      });
      showToast('LinkedIn sign up failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle LinkedIn Sign In
  const handleLinkedInSignIn = async () => {
    setIsLoading('linkedin');
    setErrors({});
    
    try {
      await loginWithPopup({
        connection: 'linkedin',
        prompt: 'login',
        scope: 'openid profile email'
      });
      // Auth0Callback component will handle the rest
    } catch (error) {
      console.error('LinkedIn Sign In error:', error);
      setErrors({
        submit: error.message || 'Failed to sign in with LinkedIn. Please try again.'
      });
      showToast('LinkedIn sign in failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Add this new handler function inside LoginSignup component
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetEmailSent(true);
      showToast('Password reset email sent successfully!', 'success');
    } catch (error) {
      console.error('Password reset error:', error);
      const errorMessage = handleAuthError(error);
      setErrors({ resetEmail: errorMessage });
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
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
          <AuthToggle 
            isSignupActive={isSignupActive} 
            onToggle={setIsSignupActive} 
          />

          {isSignupActive ? (
            <>
              <SocialLogin 
                onGoogleClick={handleGoogleSignIn}
                onLinkedInClick={handleLinkedInSignUp}
                isLoading={isLoading}
                isSignUp={true}
              />

              {/* Signup Form */}
              <form onSubmit={handleSignup}>
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
                      value={formData.phoneCode}
                      name="phoneCode"
                      onChange={handleChange}
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
                      placeholder="Enter phone number"
                      className={errors.phoneNumber ? 'error' : ''}
                    />
                  </div>
                  {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
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
                                ? calculatePasswordStrength(formData.password).label.toLowerCase().replace(' ', '-')
                                : ''
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`strength-label ${calculatePasswordStrength(formData.password).label.toLowerCase().replace(' ', '-')}`}>
                        {calculatePasswordStrength(formData.password).label}
                      </span>
                    </div>
                  )}
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <AuthButton 
                  isLoading={isLoading}
                  loadingText="Creating Account..."
                >
                  Create Account
                </AuthButton>
                
                {errors.submit && (
                  <div className="error-message submit-error">
                    {errors.submit}
                  </div>
                )}
              </form>
            </>
          ) : (
            <>
              <SocialLogin 
                onGoogleClick={handleGoogleSignIn}
                onLinkedInClick={handleLinkedInSignIn}
                isLoading={isLoading}
                isSignUp={false}
              />

              {/* Login Form */}
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="loginEmail">Email</label>
                  <input
                    type="email"
                    id="loginEmail"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    className={errors.loginEmail ? 'error' : ''}
                    disabled={isLoading}
                  />
                  {errors.loginEmail && <span className="error-message">{errors.loginEmail}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="loginPassword">Password</label>
                  <div className="password-input">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      id="loginPassword"
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      className={errors.loginPassword ? 'error' : ''}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      disabled={isLoading}
                    >
                      <EyeIcon />
                    </button>
                  </div>
                  {errors.loginPassword && <span className="error-message">{errors.loginPassword}</span>}
                </div>

                <div className="remember-me">
                  <label>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isLoading}
                    />
                    Remember Me
                  </label>
                </div>

                <AuthButton 
                  isLoading={isLoading}
                  loadingText="Logging in..."
                >
                  Login
                </AuthButton>

                {/* Add this forgot password link */}
                <div className="forgot-password-wrapper">
                  <button 
                    type="button" 
                    onClick={() => setShowForgotPassword(true)}
                    className="forgot-password-btn"
                  >
                    Forgot your password?
                  </button>
                </div>
              </form>

              {/* 2FA Verification Modal */}
              {showTwoFactorInput && (
                <TwoFactorVerification
                  twoFactorCode={twoFactorCode}
                  setTwoFactorCode={setTwoFactorCode}
                  onSubmit={handleTwoFactorSubmit}
                  isLoading={isLoading}
                  error={errors.twoFactor}
                  setErrors={setErrors}
                />
              )}
            </>
          )}
        </div>

        <footer className="signup-footer">
          <div className="footer-content">
            <span className="copyright">
              Copyright 2021 - 2022 Feedo Inc. All rights Reserved
            </span>
            <Link to="/admin/login" className="admin-login-link">
              Admin Login
            </Link>
          </div>
        </footer>
      </div>

      <ForgotPassword 
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
};

export default LoginSignup;