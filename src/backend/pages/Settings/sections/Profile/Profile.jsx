/**
 * Profile Section Component
 * Features:
 * - Animated profile photo with hover effects
 * - Interactive upload button
 * - Smooth transitions and shadows
 * - AuthContext integration
 */

import React, { useState } from 'react';
import { FiUser, FiCreditCard, FiBell, FiCamera, FiShield } from 'react-icons/fi';
import AnimatedNumber from '../../../../components/Animated/AnimatedNumber';
import './Profile.css';
import { FALLBACK_PROFILE_IMAGE, getEmojiAvatar } from '../../../../constants/profileData';
import { storage } from '../../../../../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../../../../auth/AuthContext';  // Import useAuth

const Profile = ({ activeSection, onSectionChange }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Use AuthContext instead of direct Firebase auth
  const { user, loading: authLoading, updateProfile } = useAuth();

  const menuItems = [
    { id: 'account', icon: FiUser, label: 'Account' },
    { id: 'payment', icon: FiCreditCard, label: 'Payment' },
    { id: 'notification', icon: FiBell, label: 'Notification' },
    { id: 'two-step', icon: FiShield, label: 'Two-Step Authentication' }
  ];

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      // Create a reference to the storage location
      const storageRef = ref(storage, `profile-photos/${user.authUid}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const photoURL = await getDownloadURL(storageRef);
      
      // Use AuthContext updateProfile instead of direct Firebase call
      await updateProfile({ photoURL });
      
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="profile-section">
      <h2 className="section-title">Profile</h2>
      
      <div className="profile-content">
        {authLoading ? (
          <div className="profile-loading">
            <div className="skeleton skeleton-photo"></div>
            <div className="skeleton skeleton-text name"></div>
            <div className="skeleton skeleton-text email"></div>
            <div className="skeleton skeleton-text type"></div>
          </div>
        ) : (
          <>
            <div 
              className="profile-photo-container"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className={`profile-photo ${isHovered ? 'hovered' : ''}`}>
                <div className="photo-wrapper">
                  <img 
                    src={user?.isGoogleUser ? user.photoURL : 
                         (user?.photoURL || (user?.uid ? getEmojiAvatar(user.uid) : FALLBACK_PROFILE_IMAGE))}
                    alt="Profile"
                    className={`photo ${isUploading ? 'uploading' : ''} ${imageLoaded ? 'loaded' : ''}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                      if (!user?.isGoogleUser) {
                        e.target.src = user?.uid ? getEmojiAvatar(user.uid) : FALLBACK_PROFILE_IMAGE;
                      }
                      setImageLoaded(true);
                    }}
                  />
                  {!imageLoaded && (
                    <div className="photo-placeholder">
                      <FiUser className="placeholder-icon" />
                    </div>
                  )}
                  {isHovered && (
                    <label className="photo-overlay" htmlFor="photo-upload">
                      <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <FiCamera className="overlay-icon" />
                      <span className="overlay-text">
                        {isUploading ? 'Uploading...' : 'Change Photo'}
                      </span>
                    </label>
                  )}
                </div>
                <div className="status-indicator">
                  <span className="status-dot"></span>
                </div>
              </div>
            </div>

            <div className="profile-info">
              <h3 className="profile-name">
                {user?.displayName || 'User'}
                <span className="profile-status">Active</span>
              </h3>
              <p className="profile-email">{user?.email}</p>
              <p className="profile-category">{user?.profileType}</p>
              
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">
                    <AnimatedNumber value={42} />
                  </span>
                  <span className="stat-label">Applications</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-value">
                    <AnimatedNumber value={89} />%
                  </span>
                  <span className="stat-label">Profile</span>
                </div>
              </div>
            </div>

            <nav className="profile-nav">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => onSectionChange(item.id)}
                >
                  <item.icon className="nav-icon" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;