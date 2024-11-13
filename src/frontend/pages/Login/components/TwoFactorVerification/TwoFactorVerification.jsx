/**
 * TwoFactorVerification Component
 * 
 * Features:
 * - Handles 2FA code verification
 * - Shows loading state
 * - Error handling
 * - Clean UI for code input
 */

import React from 'react';
import { FiShield } from 'react-icons/fi';
import LoadingSpinner from '../../../../../backend/components/LoadingSpinner/LoadingSpinner';
import './TwoFactorVerification.css';

const TwoFactorVerification = ({ 
  twoFactorCode, 
  setTwoFactorCode, 
  onSubmit, 
  isLoading, 
  error 
}) => {
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
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit code"
              className={error ? 'error' : ''}
              disabled={isLoading}
              autoFocus
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <button 
            type="submit" 
            className="verify-btn"
            disabled={isLoading || twoFactorCode.length !== 6}
          >
            {isLoading ? (
              <span className="loading-content">
                <LoadingSpinner size="xs" color="text-white" />
                <span>Verifying...</span>
              </span>
            ) : (
              'Verify'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TwoFactorVerification; 