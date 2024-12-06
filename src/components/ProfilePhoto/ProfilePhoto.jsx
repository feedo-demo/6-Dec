/**
 * ProfilePhoto Component
 * A unified component for displaying user profile photos across the application
 * Features:
 * - Enhanced Google photo handling with token refresh
 * - Photo URL caching
 * - Custom uploaded photos
 * - Loading states
 * - Error fallbacks
 * - Configurable size and hover effects
 */

import React, { useState, useEffect, useCallback } from 'react';
import { FiUser, FiCamera } from 'react-icons/fi';
import { FALLBACK_PROFILE_IMAGE, getEmojiAvatar } from '../../auth/profileData';
import { useAuth } from '../../auth/AuthContext';
import { auth } from '../../firebase/config';
import './ProfilePhoto.css';

const ProfilePhoto = ({
  size = 'medium', // 'small', 'medium', 'large'
  editable = false,
  onUpload = null,
  showStatus = false,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cachedPhotoURL, setCachedPhotoURL] = useState('');
  const { user, loading: authLoading, refreshUser } = useAuth();

  // Function to check if a URL is accessible
  const isUrlAccessible = useCallback(async (url) => {
    if (!url) return false;
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }, []);

  // Function to get the most up-to-date photo URL for Google users
  const getGooglePhotoURL = useCallback(async () => {
    console.log('Fetching Google photo URL:', {
      authCurrentUser: auth.currentUser ? {
        photoURL: auth.currentUser.photoURL,
        providerData: auth.currentUser.providerData
      } : null,
      userProfile: user?.profile
    });

    // Try Firebase auth user's photo URL first (most up-to-date)
    if (auth.currentUser?.photoURL) {
      const isAccessible = await isUrlAccessible(auth.currentUser.photoURL);
      if (isAccessible) {
        console.log('Using auth.currentUser photoURL:', auth.currentUser.photoURL);
        return auth.currentUser.photoURL;
      }
    }

    // Then try profile photoURL
    if (user?.profile?.photoURL) {
      const isAccessible = await isUrlAccessible(user.profile.photoURL);
      if (isAccessible) {
        console.log('Using profile photoURL:', user.profile.photoURL);
        return user.profile.photoURL;
      }
    }

    // If neither works, try to refresh the token
    try {
      console.log('Attempting to refresh user token...');
      await refreshUser();
      if (auth.currentUser?.photoURL) {
        const isAccessible = await isUrlAccessible(auth.currentUser.photoURL);
        if (isAccessible) {
          console.log('Using refreshed auth.currentUser photoURL:', auth.currentUser.photoURL);
          return auth.currentUser.photoURL;
        }
      }
    } catch (error) {
      console.error('Error refreshing Google photo:', error);
    }

    return null;
  }, [user?.profile?.photoURL, refreshUser, isUrlAccessible]);

  const getProfileImage = useCallback(async () => {
    if (authLoading) return FALLBACK_PROFILE_IMAGE;
    
    // If we have a cached URL and it's still accessible, use it
    if (cachedPhotoURL) {
      const isAccessible = await isUrlAccessible(cachedPhotoURL);
      if (isAccessible) return cachedPhotoURL;
    }
    
    // For Google users
    if (user?.profile?.provider === 'google.com') {
      const googlePhotoURL = await getGooglePhotoURL();
      if (googlePhotoURL) {
        setCachedPhotoURL(googlePhotoURL);
        return googlePhotoURL;
      }
    }
    
    // For users with custom uploaded photos
    if (user?.profile?.photoURL) {
      const isAccessible = await isUrlAccessible(user.profile.photoURL);
      if (isAccessible) {
        setCachedPhotoURL(user.profile.photoURL);
        return user.profile.photoURL;
      }
    }
    
    // Fallback to emoji avatar if we have authUid
    if (user?.profile?.authUid) {
      const emojiAvatar = getEmojiAvatar(user.profile.authUid);
      setCachedPhotoURL(emojiAvatar);
      return emojiAvatar;
    }
    
    return FALLBACK_PROFILE_IMAGE;
  }, [user, authLoading, cachedPhotoURL, getGooglePhotoURL]);

  // Effect to update photo URL when user changes
  useEffect(() => {
    let mounted = true;

    const updatePhotoURL = async () => {
      if (!authLoading && mounted) {
        const newPhotoURL = await getProfileImage();
        if (mounted && newPhotoURL !== cachedPhotoURL) {
          setCachedPhotoURL(newPhotoURL);
        }
      }
    };

    updatePhotoURL();

    return () => {
      mounted = false;
    };
  }, [user, authLoading, getProfileImage, cachedPhotoURL]);

  const handlePhotoError = async (e) => {
    console.log('Photo load error. Current state:', {
      cachedPhotoURL,
      provider: user?.profile?.provider,
      authCurrentUser: auth.currentUser ? {
        photoURL: auth.currentUser.photoURL,
        providerData: auth.currentUser.providerData
      } : null
    });

    // Clear cached URL on error
    setCachedPhotoURL('');
    
    // For Google users, try to refresh the token and get new URL
    if (user?.profile?.provider === 'google.com') {
      try {
        console.log('Attempting to refresh Google photo...');
        const newPhotoURL = await getGooglePhotoURL();
        if (newPhotoURL) {
          console.log('Successfully got new Google photo URL:', newPhotoURL);
          e.target.src = newPhotoURL;
          setCachedPhotoURL(newPhotoURL);
          return;
        }
      } catch (error) {
        console.error('Error refreshing Google profile photo:', error);
      }
    }
    
    // Fallback for non-Google users or if refresh fails
    const fallbackURL = user?.profile?.authUid ? 
      getEmojiAvatar(user.profile.authUid) : 
      FALLBACK_PROFILE_IMAGE;
    
    console.log('Using fallback URL:', fallbackURL);
    e.target.src = fallbackURL;
    setCachedPhotoURL(fallbackURL);
  };

  const handleUploadClick = () => {
    if (onUpload && !isLoading) {
      onUpload();
    }
  };

  const containerClasses = `
    profile-photo-container
    profile-photo-${size}
    ${className}
    ${isLoading ? 'loading' : ''}
  `.trim();

  return (
    <div 
      className={containerClasses}
      onMouseEnter={() => editable && setIsHovered(true)}
      onMouseLeave={() => editable && setIsHovered(false)}
    >
      <div className={`profile-photo ${isHovered ? 'hovered' : ''}`}>
        <div className="photo-wrapper">
          <img 
            src={cachedPhotoURL || FALLBACK_PROFILE_IMAGE}
            alt={`${user?.profile?.firstName || 'User'}'s profile`}
            className={`photo ${imageLoaded ? 'loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
            onError={handlePhotoError}
          />
          {!imageLoaded && (
            <div className="photo-placeholder">
              <FiUser className="placeholder-icon" />
            </div>
          )}
          {editable && (isHovered || isLoading) && (
            <div 
              className="photo-overlay"
              onClick={handleUploadClick}
            >
              <FiCamera className="overlay-icon" />
              <span className="overlay-text">
                {isLoading ? 'Uploading...' : 'Change Photo'}
              </span>
            </div>
          )}
        </div>
        {showStatus && (
          <div className="status-indicator">
            <span className="status-dot"></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePhoto; 