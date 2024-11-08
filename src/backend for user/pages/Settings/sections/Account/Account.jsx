/**
 * Account Section Component
 * Features:
 * - Enhanced form validation
 * - Interactive tooltips
 * - Loading states
 * - Success/Error feedback
 * - Smooth animations
 */

import React, { useState } from 'react';
import { 
  FiInfo, FiAlertTriangle, FiLoader, FiCheck, FiX
} from 'react-icons/fi';
import './Account.css';
import ChangePassword from '../Popups/ChangePassword/ChangePassword';
import { useAuth } from '../../../../../auth/AuthContext';
import { db, auth } from '../../../../../firebase/config';
import { collection, query, where, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Account = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, updateProfile, deleteAccount } = useAuth();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    phoneCode: user?.phoneCode || '+44',
    companyName: user?.companyName || '',
    companySize: user?.companySize || '',
    location: user?.location || '',
    timezone: user?.timezone || '',
    currency: user?.currency || '',
    receiveUpdates: user?.receiveUpdates || false
  });

  const [loading, setLoading] = useState(false);
  const [fieldStates, setFieldStates] = useState({});
  const [showChangePassword, setShowChangePassword] = useState(false);

  const fieldTooltips = {
    firstName: "Your legal first name as it appears on official documents. This will be used for all official communications.",
    lastName: "Your legal last name or surname. Make sure it matches your official documents for verification purposes.",
    email: "Your primary email address for account notifications, security alerts, and communications. Must be a valid email you can access.",
    phone: "A valid phone number where you can be reached. Used for account security and important notifications.",
    companyName: "The legal registered name of your business. For freelancers, you can use your personal business name.",
    companySize: "Select the range that best represents your total number of employees. This helps us customize your experience.",
    location: "Your primary business location or headquarters. This helps us provide region-specific features and support.",
    timezone: "Your local time zone for accurate scheduling, notifications, and reporting. Updates automatically with location.",
    currency: "Your preferred currency for billing, invoices, and financial reporting. Can be changed later if needed.",
  };

  const validationRules = {
    firstName: (value) => {
      if (!value) return "First name is required";
      if (value.length < 2) return "First name must be at least 2 characters";
      return null;
    },
    email: (value) => {
      if (!value) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address";
      return null;
    },
    phone: (value) => {
      if (!value) return "Phone number is required";
      if (!/^\d{10,}$/.test(value.replace(/[^0-9]/g, ''))) return "Please enter a valid phone number";
      return null;
    }
  };

  const renderLabel = (label, required = false, tooltipText) => (
    <label className="field-label">
      <span className="label-text">
        {label} 
        {required && <span className="required">*</span>}
      </span>
      <div className="field-info">
        <FiInfo className="info-icon" />
        <div className="info-tooltip">
          <div className="tooltip-content">
            {tooltipText}
            {required && (
              <div className="required-hint">
                This field is required for your account
              </div>
            )}
          </div>
        </div>
      </div>
    </label>
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Simulate field validation
    setFieldStates(prev => ({
      ...prev,
      [name]: { loading: true }
    }));

    setTimeout(() => {
      setFieldStates(prev => ({
        ...prev,
        [name]: { 
          success: value.length > 0,
          error: value.length === 0 ? 'This field is required' : null
        }
      }));
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Use AuthContext's updateProfile method
      await updateProfile({
        ...formData,
        phoneNumber: `${formData.phoneCode}${formData.phone}`
      });
      
      // Show success state
      setFieldStates(prev => ({
        ...prev,
        submit: { success: true }
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      setFieldStates(prev => ({
        ...prev,
        submit: { error: 'Failed to update profile. Please try again.' }
      }));
    } finally {
      setLoading(false);
    }
  };

  const renderFieldStatus = (name) => {
    const state = fieldStates[name];
    if (state?.loading) {
      return (
        <div className="field-status loading">
          <FiLoader className="animate-spin" />
          <span className="status-text">Checking...</span>
        </div>
      );
    }
    if (state?.success) {
      return (
        <div className="field-status success">
          <FiCheck />
          <span className="status-text">Looks good!</span>
        </div>
      );
    }
    if (state?.error) {
      return (
        <div className="field-status error">
          <FiX />
          <span className="status-text">{state.error}</span>
        </div>
      );
    }
    return null;
  };

  const renderFormGroup = (name, label, required = false, type = "text", options = null) => (
    <div className={`form-group ${fieldStates[name]?.error ? 'error' : ''} ${fieldStates[name]?.success ? 'success' : ''}`}>
      {renderLabel(label, required, fieldTooltips[name])}
      <div className="input-wrapper">
        {type === "select" ? (
          <select
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
            className="form-input"
          >
            <option value="">Select {label}</option>
            {options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
            className="form-input"
            placeholder={`Enter your ${label.toLowerCase()}`}
          />
        )}
        {renderFieldStatus(name)}
      </div>
    </div>
  );

  const handlePhoneCodeChange = (e) => {
    setFormData(prev => ({
      ...prev,
      phoneCode: e.target.value
    }));
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await deleteAccount();
        navigate('/login', { replace: true });
      } catch (error) {
        console.error('Error deleting account:', error);
        setFieldStates(prev => ({
          ...prev,
          submit: { error: 'Failed to delete account. Please try again.' }
        }));
      }
    }
  };

  if (authLoading) {
    return (
      <div className="account-section">
        <div className="loading-skeleton">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-form"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-section">
      <h2 className="section-title">Account</h2>

      <form className="account-form" onSubmit={handleSubmit}>
        {/* First Name & Last Name */}
        <div className="form-row">
          <div className="form-group">
            {renderLabel('First Name', true, fieldTooltips.firstName)}
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              disabled
              className="form-input disabled"
            />
          </div>

          <div className="form-group">
            {renderLabel('Last Name', false, fieldTooltips.lastName)}
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              disabled
              className="form-input disabled"
            />
          </div>
        </div>

        {/* Email & Phone */}
        <div className="form-row">
          <div className="form-group">
            {renderLabel('Email Address', true, fieldTooltips.email)}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            {renderLabel('Phone Number', true, fieldTooltips.phone)}
            <div className="phone-input">
              <div className="phone-code-select">
                <select 
                  name="phoneCode"
                  value={formData.phoneCode}
                  onChange={handlePhoneCodeChange}
                  className="phone-code"
                >
                  <option value="+44">+44</option>
                  <option value="+1">+1</option>
                  <option value="+91">+91</option>
                  <option value="+81">+81</option>
                  <option value="+49">+49</option>
                  <option value="+33">+33</option>
                  <option value="+39">+39</option>
                  <option value="+34">+34</option>
                  <option value="+61">+61</option>
                </select>
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Company Name & Size */}
        <div className="form-row">
          <div className="form-group">
            {renderLabel('Company Name', true, fieldTooltips.companyName)}
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            {renderLabel('Company Size', false, fieldTooltips.companySize)}
            <select
              name="companySize"
              value={formData.companySize}
              onChange={handleInputChange}
            >
              <option value=""></option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201+">201+ employees</option>
            </select>
          </div>
        </div>

        {/* Location & Timezone */}
        <div className="form-row">
          <div className="form-group">
            {renderLabel('Location', false, fieldTooltips.location)}
            <select
              name="location"
              value={formData.location}
              onChange={handleInputChange}
            >
              <option value=""></option>
              <option value="London">London</option>
              <option value="New York">New York</option>
              <option value="Tokyo">Tokyo</option>
            </select>
          </div>

          <div className="form-group">
            {renderLabel('Time Zone', false, fieldTooltips.timezone)}
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleInputChange}
            >
              <option value=""></option>
              <option value="GMT+0">GMT+0</option>
              <option value="GMT+1">GMT+1</option>
              <option value="GMT+2">GMT+2</option>
            </select>
          </div>
        </div>

        {/* Currency */}
        <div className="form-row">
          <div className="form-group">
            {renderLabel('Currency', false, fieldTooltips.currency)}
            <select
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
            >
              <option value=""></option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>

        {/* Updates Checkbox - Compact version */}
        <div className="form-group">
          <label className="checkbox-label">
            <div className="checkbox-wrapper">
              <input
                type="checkbox"
                name="receiveUpdates"
                checked={formData.receiveUpdates}
                onChange={handleInputChange}
              />
              <div className="checkbox-custom">
                <FiCheck className="check-icon" />
              </div>
            </div>
            <div className="checkbox-content">
              <span className="checkbox-text">Stay updated with Feedo</span>
              <span className="checkbox-description">
                Receive product updates, feature announcements, and monthly newsletters to stay informed about new improvements.
              </span>
            </div>
          </label>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <div className="action-btns">
            <button type="button" className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save
            </button>
          </div>
        </div>

        {/* Password Section */}
        <div className="password-section">
          <h3>Password</h3>
          <p className="last-changed">Last password change was on 20 Sep 2022</p>
          <button 
            type="button" 
            className="change-password-btn"
            onClick={() => setShowChangePassword(true)}
          >
            Change Password
          </button>
        </div>

        {/* New Delete Account Section */}
        <div className="delete-account-section">
          <div className="warning-tag">
            <FiAlertTriangle />
            <span>Caution</span>
          </div>
          <h3>Delete Account</h3>
          <p className="delete-description">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button type="button" className="delete-btn" onClick={handleDeleteAccount}>
            Delete My Account
          </button>
        </div>
      </form>

      {showChangePassword && (
        <ChangePassword 
          isOpen={showChangePassword}
          onClose={() => setShowChangePassword(false)}
        />
      )}
    </div>
  );
};

export default Account;