/**
 * Change Password Popup Component
 * Features:
 * - Current password validation
 * - New password requirements checking
 * - Password strength indicator
 * - Real-time validation feedback
 * - Smooth animations and transitions
 */

import React, { useState } from 'react';
import { FiLock, FiEye, FiEyeOff, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import './ChangePassword.css';
import { auth } from '../../firebase/config';
import { 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  updatePassword 
} from 'firebase/auth';
import { useToast } from '../../components/Toast/ToastContext';

const ChangePassword = ({ isOpen, onClose, onPasswordChanged }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // Password requirements
  const requirements = [
    { id: 'length', label: 'At least 8 characters', regex: /.{8,}/ },
    { id: 'uppercase', label: 'One uppercase letter', regex: /[A-Z]/ },
    { id: 'lowercase', label: 'One lowercase letter', regex: /[a-z]/ },
    { id: 'number', label: 'One number', regex: /[0-9]/ },
    { id: 'special', label: 'One special character', regex: /[!@#$%^&*]/ }
  ];

  const validatePassword = (password) => {
    return requirements.map(req => ({
      ...req,
      met: req.regex.test(password)
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Check required fields
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    }

    // Check password match
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Check password requirements
    const passwordChecks = validatePassword(formData.newPassword);
    const hasFailedRequirements = passwordChecks.some(req => !req.met);
    if (hasFailedRequirements) {
      newErrors.newPassword = 'Password does not meet all requirements';
    }

    // Check if new password is same as current
    if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validate form
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No authenticated user found');
      }

      // Create credentials with current password
      const credential = EmailAuthProvider.credential(
        user.email,
        formData.currentPassword
      );

      // Reauthenticate user
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, formData.newPassword);

      // Call onPasswordChanged callback
      if (onPasswordChanged) {
        await onPasswordChanged();
      }

      showToast('Password changed successfully!', 'success');
      onClose();
    } catch (error) {
      console.error('Password change error:', error);
      
      // Handle specific error cases
      if (error.code === 'auth/wrong-password') {
        setErrors({
          currentPassword: 'Current password is incorrect'
        });
      } else if (error.code === 'auth/requires-recent-login') {
        setErrors({
          submit: 'Please log in again before changing your password'
        });
      } else {
        setErrors({
          submit: 'Failed to change password. Please try again.'
        });
      }
      showToast('Failed to change password. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="popup-header">
          <h3>Change Password</h3>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="password-form">
          {/* Current Password */}
          <div className="form-group">
            <label>Current Password</label>
            <div className="password-input-wrapper">
              <FiLock className="field-icon" />
              <input
                type={showPasswords.current ? 'text' : 'password'}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className={errors.currentPassword ? 'error' : ''}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.currentPassword && (
              <span className="error-message">
                <FiAlertCircle /> {errors.currentPassword}
              </span>
            )}
          </div>

          {/* New Password */}
          <div className="form-group">
            <label>New Password</label>
            <div className="password-input-wrapper">
              <FiLock className="field-icon" />
              <input
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className={errors.newPassword ? 'error' : ''}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.newPassword && (
              <span className="error-message">
                <FiAlertCircle /> {errors.newPassword}
              </span>
            )}
          </div>

          {/* Password Requirements */}
          <div className="password-requirements">
            {validatePassword(formData.newPassword).map(req => (
              <div 
                key={req.id} 
                className={`requirement ${req.met ? 'met' : ''}`}
              >
                {req.met ? <FiCheck /> : <FiAlertCircle />}
                <span>{req.label}</span>
              </div>
            ))}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label>Confirm New Password</label>
            <div className="password-input-wrapper">
              <FiLock className="field-icon" />
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error' : ''}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-message">
                <FiAlertCircle /> {errors.confirmPassword}
              </span>
            )}
          </div>

          {errors.submit && (
            <div className="submit-error">
              <FiAlertCircle /> {errors.submit}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className={`submit-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword; 