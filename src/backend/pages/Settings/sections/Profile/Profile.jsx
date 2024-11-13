/**
 * Profile Section Component
 * Features:
 * - Animated profile photo with hover effects
 * - Interactive upload button
 * - Smooth transitions and shadows
 * - AuthContext integration
 */

import React, { useState, useEffect } from 'react';
import { FiUser, FiCreditCard, FiBell, FiCamera, FiShield } from 'react-icons/fi';
import AnimatedNumber from '../../../../components/Animated/AnimatedNumber';
import './Profile.css';
import { FALLBACK_PROFILE_IMAGE, getEmojiAvatar } from '../../../../constants/profileData';
import { storage } from '../../../../../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../../../../auth/AuthContext';  // Import useAuth
import { applicationOperations } from '../../../../../applications/applicationManager';

const Profile = ({ activeSection, onSectionChange }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [stats, setStats] = useState({
    applications: 0,
    profileCompletion: 0
  });

  // Use AuthContext instead of direct Firebase auth
  const { user, loading: authLoading, updateProfile } = useAuth();

  const menuItems = [
    { id: 'account', icon: FiUser, label: 'Account' },
    { id: 'payment', icon: FiCreditCard, label: 'Payment' },
    { id: 'notification', icon: FiBell, label: 'Notification' },
    { id: 'two-step', icon: FiShield, label: 'Two-Step Authentication' }
  ];

  const getProfileImage = () => {
    if (authLoading) return FALLBACK_PROFILE_IMAGE;
    
    // For Google users
    if (user?.profile?.provider === 'google' && user?.profile?.photoURL) {
      return user.profile.photoURL;
    }
    
    // For users with custom uploaded photos
    if (user?.profile?.photoURL) {
      return user.profile.photoURL;
    }
    
    // Fallback to emoji avatar if we have authUid
    if (user?.profile?.authUid) {
      return getEmojiAvatar(user.profile.authUid);
    }
    
    return FALLBACK_PROFILE_IMAGE;
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      const storageRef = ref(storage, `profile-photos/${user.profile.authUid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      
      await updateProfile({
        profile: {
          ...user.profile,
          photoURL
        }
      });
      
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Helper function to format profile type
  const formatProfileType = (type) => {
    if (!type) return '';
    // Convert jobseeker to Job Seeker, etc.
    return type
      .split(/(?=[A-Z])|_/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Add this console.log to debug
  console.log('User data in Profile:', user);

  // Add useEffect to fetch real stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.profile?.authUid) return;

      try {
        // Fetch application stats
        const applicationStats = await applicationOperations.getApplicationStats(user.profile.authUid);

        // Calculate profile completion
        const completedSections = calculateCompletedSections(user);
        const totalSections = 4; // Personal, Education, Work Experience, Verification
        const profileCompletion = Math.round((completedSections / totalSections) * 100);

        setStats({
          applications: applicationStats.total || 0,
          profileCompletion: profileCompletion
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [user]);

  // Helper function to calculate completed sections
  const calculateCompletedSections = (user) => {
    let completed = 0;

    // Check Personal Data
    if (user?.profile?.firstName && 
        user?.profile?.lastName && 
        user?.profile?.email && 
        user?.profile?.phoneNumber && 
        user?.profile?.location && 
        user?.profile?.professionalSummary) {
      completed++;
    }

    // Check Education
    if (user?.education?.degreeLevel && 
        user?.education?.fieldOfStudy && 
        user?.education?.institutionName && 
        user?.education?.graduationDate) {
      completed++;
    }

    // Check Work Experience
    if (user?.workExperience?.length > 0) {
      completed++;
    }

    // Check Verification
    if (user?.verification?.isVerified) {
      completed++;
    }

    return completed;
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
                    src={getProfileImage()}
                    alt="Profile"
                    className={`photo ${isUploading ? 'uploading' : ''} ${imageLoaded ? 'loaded' : ''}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                      if (user?.profile?.provider !== 'google') {
                        e.target.src = user?.profile?.authUid ? 
                          getEmojiAvatar(user.profile.authUid) : 
                          FALLBACK_PROFILE_IMAGE;
                      } else {
                        e.target.src = FALLBACK_PROFILE_IMAGE;
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
                {user?.profile?.firstName && user?.profile?.lastName ? 
                  `${user.profile.firstName} ${user.profile.lastName}` : 
                  user?.metadata?.firstName && user?.metadata?.lastName ?
                  `${user.metadata.firstName} ${user.metadata.lastName}` :
                  'User'
                }
                {user?.profile?.userType && (
                  <span className={`profile-status ${user.profile.userType}`}>
                    {formatProfileType(user.profile.userType)}
                  </span>
                )}
              </h3>
              <p className="profile-email">{user?.profile?.email}</p>
              
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">
                    <AnimatedNumber value={stats.applications} />
                  </span>
                  <span className="stat-label">Applications</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-value">
                    <AnimatedNumber value={stats.profileCompletion} />%
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