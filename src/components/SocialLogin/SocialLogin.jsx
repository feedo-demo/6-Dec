/**
 * SocialLogin Component
 * 
 * Features:
 * - Social login options container
 * - Divider between social and email login
 * - Multiple social login options
 */

import React from 'react';
import GoogleLogin from './components/GoogleLogin/GoogleLogin';
import LinkedInLogin from './components/LinkedInLogin/LinkedInLogin';
import './SocialLogin.css';

const SocialLogin = ({ 
  onGoogleClick,
  onLinkedInClick,
  isLoading, 
  isSignUp = true 
}) => {
  return (
    <div className="social-login">
      <div className="social-buttons">
        <GoogleLogin 
          onClick={onGoogleClick}
          isLoading={isLoading === 'google'}
          isSignUp={isSignUp}
        />
        <LinkedInLogin 
          onClick={onLinkedInClick}
          isLoading={isLoading === 'linkedin'}
          isSignUp={isSignUp}
        />
      </div>

      <div className="divider">
        <span>Or</span>
      </div>
    </div>
  );
};

export default SocialLogin; 