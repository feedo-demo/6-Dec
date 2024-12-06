/**
 * AuthToggle Component
 * 
 * Features:
 * - Toggle between signup and login views
 * - Animated slider
 * - Active state handling
 */

import React from 'react';
import './AuthToggle.css';

const AuthToggle = ({ isSignupActive, onToggle }) => {
  return (
    <div className="auth-toggle">
      <button 
        className={`toggle-btn ${isSignupActive ? 'active' : ''}`}
        onClick={() => onToggle(true)}
      >
        Sign Up
      </button>
      <button 
        className={`toggle-btn ${!isSignupActive ? 'active' : ''}`}
        onClick={() => onToggle(false)}
      >
        Login
      </button>
      <div className={`slider ${!isSignupActive ? 'right' : 'left'}`} />
    </div>
  );
};

export default AuthToggle; 