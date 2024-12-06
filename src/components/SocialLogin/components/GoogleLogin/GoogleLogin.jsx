/**
 * GoogleLogin Component
 * 
 * Features:
 * - Google Sign In/Sign Up button
 * - Loading state handling
 * - Consistent styling
 */

import React from 'react';
import { ReactComponent as GoogleIcon } from '../../../../assets/icons/google.svg';
import './GoogleLogin.css';

const GoogleLogin = ({ 
  onClick, 
  isLoading, 
  isSignUp = true 
}) => {
  return (
    <button 
      className={`google-auth-btn ${isLoading ? 'loading' : ''}`}
      onClick={onClick}
      disabled={isLoading}
    >
      <GoogleIcon />
      {isLoading 
        ? (isSignUp ? 'Signing up...' : 'Signing in...') 
        : (isSignUp ? 'Sign up with Google' : 'Sign in with Google')
      }
    </button>
  );
};

export default GoogleLogin; 