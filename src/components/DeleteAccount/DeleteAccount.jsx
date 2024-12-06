/**
 * Delete Account Popup Component
 * Features:
 * - Password confirmation for email users
 * - Email confirmation for Google users
 * - Clear warning about account deletion
 * - Smooth animations and transitions
 */

import React, { useState } from 'react';
import { FiLock, FiEye, FiEyeOff, FiX, FiAlertTriangle, FiMail } from 'react-icons/fi';
import { auth } from '../../firebase/config';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useToast } from '../../components/Toast/ToastContext';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import './DeleteAccount.css';

const DeleteAccount = ({ isOpen, onClose, onConfirmDelete }) => {
  const [password, setPassword] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is a Google user
  const isGoogleUser = user?.profile?.provider === 'google.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isGoogleUser) {
        // For Google users, verify email confirmation
        if (confirmEmail !== user.profile.email) {
          setError('Email does not match your account email');
          setLoading(false);
          return;
        }
      } else {
        // For email users, require password confirmation
        const user = auth.currentUser;
        if (!user || !user.email) {
          throw new Error('No authenticated user found');
        }

        // Require password confirmation for security
        const credential = EmailAuthProvider.credential(
          user.email,
          password
        );

        // Reauthenticate user
        await reauthenticateWithCredential(user, credential);
      }

      // Call the delete function
      await onConfirmDelete();
      
      showToast('Account deleted successfully', 'success');
      
      // Navigate to home page after successful deletion
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Delete account error:', error);
      
      if (error.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else {
        setError('Failed to delete account. Please try again.');
      }
      showToast('Failed to delete account', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content delete-account-popup">
        <div className="popup-header">
          <h3>Delete Account</h3>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="warning-section">
          <div className="warning-icon">
            <FiAlertTriangle />
          </div>
          <h4>Warning: This action cannot be undone</h4>
          <p>
            Deleting your account will:
          </p>
          <ul>
            <li>Permanently delete your profile and all associated data</li>
            <li>Remove access to all your applications and submissions</li>
            <li>Cancel any active subscriptions</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="delete-form">
          {/* Show email confirmation for Google users */}
          {isGoogleUser && (
            <div className="form-group">
              <label>Confirm your email address</label>
              <div className="email-input-wrapper">
                <FiMail className="field-icon" />
                <input
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => {
                    setConfirmEmail(e.target.value);
                    setError('');
                  }}
                  className={error ? 'error' : ''}
                  placeholder={user.profile.email}
                />
              </div>
              {error && (
                <span className="error-message">
                  {error}
                </span>
              )}
              <p className="confirmation-hint">
                Please enter your email address ({user.profile.email}) to confirm deletion
              </p>
            </div>
          )}

          {/* Show password field for email users */}
          {!isGoogleUser && (
            <div className="form-group">
              <label>Confirm your password</label>
              <div className="password-input-wrapper">
                <FiLock className="field-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className={error ? 'error' : ''}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {error && (
                <span className="error-message">
                  {error}
                </span>
              )}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`delete-btn ${loading ? 'loading' : ''}`}
              disabled={loading || (!isGoogleUser && !password) || (isGoogleUser && !confirmEmail)}
            >
              {loading ? 'Deleting Account...' : 'Delete My Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteAccount; 