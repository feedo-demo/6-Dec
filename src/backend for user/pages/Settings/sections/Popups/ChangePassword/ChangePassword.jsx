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

const ChangePassword = ({ isOpen, onClose }) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate form
    const newErrors = {};
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      onClose();
    } catch (error) {
      setErrors({
        submit: 'Failed to change password. Please try again.'
      });
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