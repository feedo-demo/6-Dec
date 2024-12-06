import React from 'react';
import { useToast } from '../../../../components/Toast/ToastContext';
import LinkedInIcon from '../../../../assets/icons/LinkedInIcon';
import './LinkedInLogin.css';

const LinkedInLogin = ({ isSignUp, isLoading }) => {
  const { showToast } = useToast();

  const handleLinkedInLogin = () => {
    showToast('LinkedIn sign in is not available yet', 'info');
  };

  return (
    <div className="linkedin-button-wrapper">
      <button
        className={`linkedin-auth-btn ${isLoading ? 'loading' : ''}`}
        onClick={handleLinkedInLogin}
        disabled={isLoading}
      >
        <LinkedInIcon />
        <span>
          {isLoading ? 'Loading...' : (isSignUp ? 'Sign up with LinkedIn' : 'Sign in with LinkedIn')}
        </span>
      </button>
    </div>
  );
};

export default LinkedInLogin; 