/**
 * Account Section Component
 * Features:
 * - Personal information management
 * - Password management (email users only)
 * - Account deletion
 */

import React, { useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import './Account.css';
import ChangePassword from '../../../../../components/ChangePassword/ChangePassword';
import DeleteAccount from '../../../../../components/DeleteAccount/DeleteAccount';
import { useAuth } from '../../../../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../../firebase/config';
// Import Personal component
import SectionForm from '../../../DataManagement/SectionForm/SectionForm';

const Account = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, deleteAccount, refreshUser } = useAuth();
  const [error, setError] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  // Debug log to check user data
  console.log('User data in Account:', {
    user,
    profile: user?.profile,
    email: user?.email
  });

  // Check if user is a Google user
  const isGoogleUser = user?.profile?.provider === 'google.com';

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      // No need to set error or navigate here
      // The DeleteAccount component will handle success/error states
    } catch (error) {
      // Only log the error, don't set it in state
      console.error('Error deleting account:', error);
      throw error; // Re-throw to let DeleteAccount component handle it
    }
  };

  // Handle successful password change
  const handlePasswordChanged = async () => {
    try {
      // Update the password last changed timestamp in Firestore
      const userRef = doc(db, 'users', user.profile.authUid);
      await updateDoc(userRef, {
        'metadata.passwordLastChanged': serverTimestamp()
      });
      
      // Refresh user data to get the updated timestamp
      await refreshUser();
      
      // Close the modal
      setShowChangePassword(false);
    } catch (error) {
      console.error('Error updating password timestamp:', error);
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

  // Format the last changed date with time
  const formatLastChanged = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    // Format date
    const dateOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };

    // Format with toLocaleString and then replace lowercase am/pm with uppercase
    return date.toLocaleString(undefined, dateOptions)
      .replace(/\b(am|pm)\b/i, match => match.toUpperCase());
  };

  return (
    <div className="account-section">
      <h2 className="section-title">Account Settings</h2>

      <div className="account-form">
        {/* Personal Information Section */}
        <div className="personal-info-section mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Personal Information</h3>
          <SectionForm 
            section={{
              id: 'personal',
              label: 'Personal Information',
              questions: [
                {
                  id: 'firstName',
                  type: 'text',
                  question: 'First Name',
                  required: true
                },
                {
                  id: 'lastName',
                  type: 'text',
                  question: 'Last Name',
                  required: true
                },
                {
                  id: 'email',
                  type: 'email',
                  question: 'Email',
                  required: true,
                  readOnly: isGoogleUser,
                  helperText: isGoogleUser ? 'Email cannot be changed for Google accounts' : undefined
                },
                {
                  id: 'phoneNumber',
                  type: 'text',
                  question: 'Phone Number',
                  required: false
                },
                {
                  id: 'professionalSummary',
                  type: 'textarea',
                  question: 'Professional Summary',
                  required: true
                }
              ]
            }}
            formData={{
              firstName: user?.profile?.firstName || '',
              lastName: user?.profile?.lastName || '',
              email: user?.profile?.email || user?.email || '',
              phoneNumber: user?.profile?.phoneNumber || '',
              professionalSummary: user?.profile?.professionalSummary || ''
            }}
            profileType={user?.profile?.userType || 'jobseeker'}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 mt-4">
            {error}
          </div>
        )}

        {/* Password Section - Only show for email users */}
        {!isGoogleUser && (
          <div className="password-section">
            <h3>Password</h3>
            <p className="last-changed">
              Last changed {formatLastChanged(user?.metadata?.passwordLastChanged)}
            </p>
            <button 
              type="button" 
              className="change-password-btn"
              onClick={() => setShowChangePassword(true)}
            >
              Change Password
            </button>
          </div>
        )}

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
            onClick={() => setShowDeleteAccount(true)}
          >
            Delete My Account
          </button>
        </div>
      </div>

      {/* Change Password Modal - Only show for non-Google users */}
      {showChangePassword && !isGoogleUser && (
        <ChangePassword 
          isOpen={showChangePassword}
          onClose={() => setShowChangePassword(false)}
          onPasswordChanged={handlePasswordChanged}
        />
      )}

      {/* Delete Account Modal */}
      <DeleteAccount 
        isOpen={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
        onConfirmDelete={handleDeleteAccount}
      />
    </div>
  );
};

export default Account;