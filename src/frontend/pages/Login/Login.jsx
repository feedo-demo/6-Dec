/**
 * Login Page Component
 * Features:
 * - Google Sign In integration with Firebase
 * - Email/Password login form
 * - Remember Me functionality
 * - Password visibility toggle
 * - Sign Up link
 * - Need help support link
 * - Responsive design
 */

// React and core dependencies
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Styles
import './Login.css';

// SVG Icons
import { ReactComponent as GoogleIcon } from '../../assets/icons/google.svg';
import { ReactComponent as EyeIcon } from '../../assets/icons/eye.svg';

// Images
import feedoLogo from '../../assets/images/feedo-logo.png';
import awardBadge from '../../assets/images/award-badge.png';
import girlImage from '../../assets/images/girl.png';

// Firebase Authentication
import { auth } from '../../../firebase/config';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';

// Add AuthContext import
import { useAuth } from '../../../auth/AuthContext';

/**
 * Login Component - Handles user authentication and login functionality
 * @component
 * @returns {JSX.Element} The rendered Login component
 */
const Login = () => {
  // Add useAuth hook
  const { login, googleSignIn } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [isLoginActive, setIsLoginActive] = useState(true);

  /**
   * Validates the login form fields
   * @returns {boolean} True if validation passes, false otherwise
   */
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles input field changes and updates form state
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event
   */
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

  /**
   * Handles form submission and user authentication
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(formData.email, formData.password);
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      // Navigate to dashboard
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        submit: getErrorMessage(error.code)
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Converts Firebase error codes to user-friendly messages
   * @param {string} errorCode - The Firebase error code
   * @returns {string} User-friendly error message
   */
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Invalid password';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      default:
        return 'Failed to login. Please try again';
    }
  };

  /**
   * Handles Google Sign In authentication
   * @returns {Promise<void>}
   */
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      await googleSignIn(false); // false indicates this is a login attempt
      
      // Navigate to dashboard for login
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error("Google Sign In Error:", error);
      setErrors({
        submit: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Effect hook to load remembered email on component mount
   */
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail
      }));
      setRememberMe(true);
    }
  }, []);

  /**
   * Handles toggle between login and signup views
   * Includes animation delay before navigation
   */
  const handleToggle = () => {
    setIsLoginActive(!isLoginActive);
    // Navigate to signup page after a small delay for smooth transition
    if (isLoginActive) {
      setTimeout(() => {
        navigate('/signup');
      }, 300);
    }
  };

  /**
   * Renders the login form and related UI elements
   * @returns {JSX.Element} The rendered JSX
   */
  return (
    <div className="login-container">
      <div className="login-left">
        <img src={feedoLogo} alt="Feedo AI Logo" className="feedo-logo" />
        <div className="hero-image">
          <img src={girlImage} alt="Professional woman with laptop" />
        </div>
        <div className="award-badges">
          <img src={awardBadge} alt="Award Badge" />
          <img src={awardBadge} alt="Award Badge" />
          <img src={awardBadge} alt="Award Badge" />
        </div>
      </div>
      
      <div className="login-right">
        <div className="login-form-container">
          <div className="auth-toggle">
            <button 
              className={`toggle-btn ${!isLoginActive ? 'active' : ''}`}
              onClick={handleToggle}
            >
              Sign Up
            </button>
            <button 
              className={`toggle-btn ${isLoginActive ? 'active' : ''}`}
              onClick={() => setIsLoginActive(true)}
            >
              Login
            </button>
            <div className={`slider ${isLoginActive ? 'right' : 'left'}`} />
          </div>

          {errors.submit && (
            <div className="error-message submit-error">
              {errors.submit}
            </div>
          )}
          
          <button 
            className="google-signin-btn" 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <GoogleIcon />
            Sign in with Google
          </button>

          <div className="divider">
            <span>Or</span>
          </div>

          {/* Login Form Section */}
          <form onSubmit={handleSubmit}>
            {/* Email Input Field Group */}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                disabled={isLoading}
                aria-label="Email input"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            {/* Password Input Field Group with Toggle Visibility */}
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
                  disabled={isLoading}
                  aria-label="Password input"
                />
                {/* Password Visibility Toggle Button */}
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon />
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {/* Remember Me Checkbox Section */}
            <div className="remember-me">
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  aria-label="Remember me checkbox"
                />
                Remember Me
              </label>
            </div>

            {/* Login Submit Button with Loading State */}
            <button 
              type="submit" 
              className={`login-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
              aria-label="Login button"
            >
              <span>{isLoading ? '' : 'Login'}</span>
            </button>
          </form>
        </div>

        {/* Footer Section with Copyright and Help */}
        <footer className="login-footer">
          {/* Copyright Information */}
          <div className="copyright">
            Copyright 2021 - 2022 Feedo Inc. All rights Reserved
          </div>
          {/* Help Support Button */}
          <button 
            className="help-btn"
            aria-label="Get help with login"
          >
            Need help?
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Login; 