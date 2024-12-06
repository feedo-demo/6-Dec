/**
 * TwoFactorVerification Component
 * 
 * Features:
 * - Handles 2FA code verification
 * - Shows loading state
 * - Error handling
 * - Clean UI for code input
 * - Auto-submit when code length is 6
 */

import React, { useEffect } from 'react';
import { FiShield } from 'react-icons/fi';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './TwoFactorVerification.css';

const TwoFactorVerification = ({ 
  twoFactorCode, 
  setTwoFactorCode, 
  onSubmit, 
  isLoading, 
  error,
  setErrors
}) => {
  // Auto-submit when code length is 6
  useEffect(() => {
    if (twoFactorCode.length === 6 && !isLoading && !error) {
      onSubmit(new Event('submit'));
    }
  }, [twoFactorCode, isLoading, error, onSubmit]);

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value !== twoFactorCode) {
      setTwoFactorCode(value);
      // Clear error when input changes
      if (error) {
        setErrors({});
      }
    }
  };

  return (
    <div className="two-factor-modal">
      <div className="two-factor-content">
        <div className="two-factor-header">
          <FiShield className="shield-icon" />
          <h2>Two-Factor Authentication</h2>
          <p>Please enter the verification code from your authenticator app.</p>
        </div>

        <form onSubmit={onSubmit} className="two-factor-form">
          <div className="code-input-container">
            <input
              type="text"
              maxLength="6"
              value={twoFactorCode}
              onChange={handleChange}
              placeholder="Enter 6-digit code"
              className={error ? 'error' : ''}
              disabled={isLoading}
              autoFocus
            />
            {error && (
              <span className="error-message">{error}</span>
            )}
          </div>

          {/* Visual loading indicator */}
          {isLoading && (
            <div className="loading-content">
              <LoadingSpinner is2FA={true} color="text-blue-500" />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default TwoFactorVerification; 