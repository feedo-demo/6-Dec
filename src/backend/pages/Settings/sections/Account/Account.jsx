/**
 * Account Section Component
 * Features:
 * - Personal information management
 * - Password management
 * - Account deletion
 */

import React, { useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import './Account.css';
import ChangePassword from '../Popups/ChangePassword/ChangePassword';
import { useAuth } from '../../../../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
// Import Personal component
import Personal from '../../../DataManagement/sections/TabsSection/Personal';

const Account = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, deleteAccount } = useAuth();
  const [error, setError] = useState(null);
  const [showChangePassword] = useState(false);

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await deleteAccount();
        navigate('/login', { replace: true });
      } catch (error) {
        console.error('Error deleting account:', error);
        setError('Failed to delete account. Please try again.');
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
      <h2 className="section-title">Account Settings</h2>

      <div className="account-form">
        {/* Personal Information Section */}
        <div className="personal-info-section mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Personal Information</h3>
          {/* Use the Personal component directly */}
          <Personal />
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 mt-4">
            {error}
          </div>
        )}

        {/* Password Section */}
        <div className="password-section">
          <h3>Password</h3>
          <p className="last-changed">
            Last changed {user?.metadata?.passwordLastChanged 
              ? new Date(user.metadata.passwordLastChanged).toLocaleDateString() 
              : 'Never'}
          </p>
          <button 
            type="button" 
            className="change-password-btn"
            onClick={() => setShowChangePassword(true)}
          >
            Change Password
          </button>
        </div>

        {/* Delete Account Section */}
        <div className="delete-account-section">
          <div className="warning-tag">
            <FiAlertTriangle />
            <span>Caution</span>
          </div>
          <h3>Delete Account</h3>
          <p className="delete-description">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button 
            type="button" 
            className="delete-btn" 
            onClick={handleDeleteAccount}
          >
            Delete My Account
          </button>
        </div>
      </div>

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