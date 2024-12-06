/**
 * AuthButton Component
 * 
 * Features:
 * - Reusable button for auth actions
 * - Loading state (spinner only)
 * - Gradient background
 * - Hover effects
 */

import React from 'react';
import './AuthButton.css';

const AuthButton = ({ 
  type = 'submit',
  isLoading = false, 
  children,
  onClick,
  className = ''
}) => {
  return (
    <button 
      type={type}
      className={`auth-button ${isLoading ? 'loading' : ''} ${className}`}
      disabled={isLoading}
      onClick={onClick}
    >
      <span>{children}</span>
    </button>
  );
};

export default AuthButton; 