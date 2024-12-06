/**
 * DataSubmission Component
 * 
 * A comprehensive data submission tracking interface that provides:
 * - Real-time progress tracking for each data section
 * - Dynamic status updates based on form completion
 * - Visual progress indicators
 * - Interactive submission items
 */

import React, { useState, useEffect, useCallback } from 'react';
import { FiAlertCircle, FiCheckCircle, FiChevronRight, FiZap } from 'react-icons/fi';
import './DataSubmission.css';
import { FALLBACK_PROFILE_IMAGE, getEmojiAvatar } from '../../../../../auth/profileData';
import { useAuth } from '../../../../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import useProfileProgress from '../../../../../hooks/useProfileProgress';
import { tokenUsageService } from '../../../../../services/tokenUsage';
import { eventEmitter, EVENTS } from '../../../../../services/eventEmitter';

const TYPE_COLORS = ['type-1', 'type-2', 'type-3', 'type-4', 'type-5', 
                    'type-6', 'type-7', 'type-8', 'type-9', 'type-10'];

const getProfileImage = (user) => {
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

// Move ProgressCircle component outside main component
const ProgressCircle = ({ progress }) => {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="progress-circle-container">
      <svg width="100%" height="100%" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0093E9" />
            <stop offset="100%" stopColor="#80D0C7" />
          </linearGradient>
        </defs>
        <circle
          className="progress-circle-bg"
          cx="60"
          cy="60"
          r={radius}
        />
        <circle
          className="progress-circle-path"
          cx="60"
          cy="60"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="progress-percentage-pill">
        {progress}%
      </div>
    </div>
  );
};

// Create a custom hook for token usage
export const useTokenUsage = (userId, userTier) => {
  const [tokenUsage, setTokenUsage] = useState(null);
  const [loadingTokens, setLoadingTokens] = useState(true);

  const fetchTokenUsage = useCallback(async () => {
    if (userId) {
      try {
        setLoadingTokens(true);
        const usage = await tokenUsageService.checkTokenAvailability(
          userId,
          userTier || 'free'
        );
        setTokenUsage(usage);
      } catch (error) {
        console.error('Error fetching token usage:', error);
      } finally {
        // Add a small delay to make the loading state visible
        setTimeout(() => {
          setLoadingTokens(false);
        }, 500);
      }
    }
  }, [userId, userTier]);

  useEffect(() => {
    fetchTokenUsage();

    // Subscribe to token usage updates
    const unsubscribe = eventEmitter.on(EVENTS.TOKEN_USAGE_UPDATED, () => {
      console.log('Token usage update event received');
      fetchTokenUsage();
    });

    return () => {
      unsubscribe(); // Cleanup subscription
    };
  }, [fetchTokenUsage]);

  return { tokenUsage, loadingTokens, refreshTokenUsage: fetchTokenUsage };
};

// Export the TokenUsageIndicator as a separate component
export const TokenUsageIndicator = ({ usage }) => {
  const percentage = usage.percentageUsed;
  const getColorClass = () => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="token-usage-section">
      <div className="token-usage-header">
        <FiZap className="token-icon" />
        <span className="token-title">AI Credits</span>
      </div>
      <div className="token-usage-bar">
        <div 
          className="token-usage-progress"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="token-usage-stats">
        <span className={`token-percentage ${getColorClass()}`}>
          {percentage}% used
        </span>
        <span className="token-remaining">
          {usage.remaining.toLocaleString()} left
        </span>
      </div>
    </div>
  );
};

const DataSubmission = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { progress, isLoading, submissionItems } = useProfileProgress();
  const { tokenUsage, loadingTokens } = useTokenUsage(
    user?.profile?.authUid,
    user?.profile?.tier
  );

  // Update the formatProfileType function
  const formatProfileType = (type) => {
    if (!type) return '';
    
    // First, handle different delimiters (camelCase, snake_case, hyphen-case)
    const words = type
      .split(/(?=[A-Z])|[-_]/) // Split on capital letters, hyphens, or underscores
      .map(word => 
        word
          .toLowerCase()
          // Capitalize first letter of each word
          .replace(/^./, str => str.toUpperCase())
      )
      .join(' ');
    
    // Get a consistent random color based on the type string
    const colorIndex = type.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % TYPE_COLORS.length;
    const colorClass = TYPE_COLORS[colorIndex];
    
    // Use the predefined class if it exists, otherwise use the random color
    const finalColorClass = ['jobseeker', 'entrepreneur', 'student', 'company', 'pending']
      .includes(type.toLowerCase()) ? type.toLowerCase() : colorClass;
    
    return (
      <span className={`profile-status ${finalColorClass}`}>
        {words}
      </span>
    );
  };

  // Add handler for section click
  const handleSectionClick = (sectionId) => {
    navigate(`/data-management?tab=${sectionId}`);
  };

  if (authLoading || isLoading || loadingTokens) {
    return (
      <div className="data-submission-container">
        <div className="data-submission-header">
          <h2 className="data-submission-title">Data Submission</h2>
        </div>
        <div className="company-progress-section">
          <div className="loading-state">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="data-submission-container">
      <div className="data-submission-header">
        <h2 className="data-submission-title">Data Submission</h2>
      </div>

      <div className="company-progress-section">
        <div className="user-profile">
          <div className="user-avatar-container">
            <ProgressCircle progress={progress} />
            <img
              src={getProfileImage(user)}
              alt="Profile"
              className="user-avatar"
              onError={(e) => {
                if (user?.profile?.provider !== 'google') {
                  e.target.src = user?.profile?.authUid ? 
                    getEmojiAvatar(user.profile.authUid) : 
                    FALLBACK_PROFILE_IMAGE;
                } else {
                  e.target.src = FALLBACK_PROFILE_IMAGE;
                }
              }}
            />
          </div>
        </div>
        <div className="company-info">
          <h3 className="company-name">
            {user?.profile?.fullName || 
             (user?.profile?.firstName ? 
              `${user.profile.firstName} ${user.profile.lastName || ''}` : 
              'User')}
          </h3>
          <p className="company-category">
            {formatProfileType(user?.profile?.userType)}
          </p>
        </div>
      </div>

      {tokenUsage && (
        <TokenUsageIndicator usage={tokenUsage} />
      )}

      <div className="submission-items-list">
        {[...submissionItems]
          .sort((a, b) => {
            if (a.status === 'complete' && b.status !== 'complete') return -1;
            if (a.status !== 'complete' && b.status === 'complete') return 1;
            return 0;
          })
          .map((item) => (
            <button
              key={item.id}
              className="submission-item"
              onClick={() => handleSectionClick(item.id)}
              aria-label={`Go to ${item.type} section`}
            >
              <div className="item-content">
                {item.status === 'complete' ? (
                  <FiCheckCircle className="status-icon complete" />
                ) : (
                  <FiAlertCircle className="status-icon incomplete" />
                )}
                <div className="item-text">
                  <p className="item-type">{item.type}</p>
                  <span className={`item-label ${item.status}`}>
                    {item.label}
                  </span>
                </div>
              </div>
              <FiChevronRight className="chevron-icon" />
            </button>
          ))}
      </div>
    </div>
  );
};

export default DataSubmission;