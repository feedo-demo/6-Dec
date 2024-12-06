/**
 * ForgotPassword Component
 * 
 * A modal component that handles the password reset functionality.
 * Features:
 * - Email input for password reset
 * - Firebase password reset integration
 * - Success/Error states
 * - Loading states
 * - Responsive design
 */

import React, { useState } from 'react';
import { auth } from '../../../firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';
import { handleAuthError } from '../../../components/Toast/toastnotifications';
import { useToast } from '../../../components/Toast/ToastContext';
import AuthButton from '../../../components/AuthButton/AuthButton';
import './ForgotPassword.css';

const ForgotPassword = ({ isOpen, onClose }) => {
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [errors, setErrors] = useState({});
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
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

  if (!isOpen) return null;

  return (
    <div className="forgot-password-modal">
      <div className="modal-content">
        <button 
          className="close-modal" 
          onClick={() => {
            onClose();
            setResetEmail('');
            setResetEmailSent(false);
            setErrors({});
          }}
        >
          ×
        </button>
        
        {!resetEmailSent ? (
          <>
            <h2>Reset Password</h2>
            <p>Enter your email address and we'll send you instructions to reset your password.</p>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="resetEmail">Email</label>
                <input
                  type="email"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className={errors.resetEmail ? 'error' : ''}
                  placeholder="Enter your email"
                />
                {errors.resetEmail && (
                  <span className="error-message">{errors.resetEmail}</span>
                )}
              </div>
              
              <AuthButton 
                isLoading={isLoading}
                loadingText="Sending..."
              >
                Send Reset Link
              </AuthButton>
            </form>
          </>
        ) : (
          <div className="reset-success">
            <h2>Email Sent!</h2>
            <p>
              We've sent password reset instructions to:
              <br />
              <strong>{resetEmail}</strong>
            </p>
            <p className="note">
              Please check your email and follow the instructions to reset your password.
              Don't forget to check your spam folder.
            </p>
            <button 
              className="close-btn"
              onClick={() => {
                onClose();
                setResetEmail('');
                setResetEmailSent(false);
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword; 