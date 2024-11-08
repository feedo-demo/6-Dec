/**
 * DataSubmission Component
 * 
 * A comprehensive data submission tracking interface that provides:
 * - User profile information display
 * - Progress circle with animated fill
 * - Submission items list with status
 * - Interactive hover states
 * - Loading states
 * 
 * Features:
 * - AuthContext integration
 * - Progress visualization
 * - Status tracking
 * - Animated transitions
 * - Responsive design
 */

import React, { useState, useEffect } from 'react';
import { FiAlertCircle, FiCheckCircle, FiChevronRight } from 'react-icons/fi';
import './DataSubmission.css';
import { FALLBACK_PROFILE_IMAGE, getEmojiAvatar } from '../../../../constants/profileData';
import { useAuth } from '../../../../../auth/AuthContext';  // Import useAuth

const DataSubmission = () => {
  // Use AuthContext instead of direct Firebase auth
  const { user, loading: authLoading } = useAuth();
  const [progress] = useState(75);

  const submissionItems = [
    {
      id: 1,
      type: 'Personal Data',
      status: 'incomplete',
      label: 'Complete Now',
      isNew: false,
    },
    {
      id: 2,
      type: 'Education Data',
      status: 'complete',
      label: 'Completed',
    },
    {
      id: 3,
      type: 'Work Experience',
      status: 'incomplete',
      label: 'Complete Now',
      isNew: true,
    },
    {
      id: 4,
      type: 'Skills & Certifications',
      status: 'incomplete',
      label: 'Complete Now',
      isNew: false,
    }
  ];

  const formatProfileType = (type) => {
    if (!type) return '';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const ProgressCircle = ({ progress }) => {
    const radius = 58;
    const circumference = 2 * Math.PI * radius;
    const [currentProgress, setCurrentProgress] = useState(0);

    useEffect(() => {
      setCurrentProgress(0);
      const timer = setTimeout(() => {
        setCurrentProgress(progress);
      }, 300);

      return () => clearTimeout(timer);
    }, []);

    const strokeDashoffset = circumference - (currentProgress / 100) * circumference;

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
          {Math.round(currentProgress)}%
        </div>
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="data-submission-container">
        <div className="data-submission-header">
          <h2 className="data-submission-title">Data Submission</h2>
        </div>
        <div className="company-progress-section">
          <div className="user-profile">
            <div className="user-avatar-container loading-avatar">
              <div className="loading-spinner"></div>
            </div>
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
        {!authLoading && user && (
          <div className="user-profile">
            <div className="user-avatar-container">
              <ProgressCircle progress={progress} />
              <img
                src={user.isGoogleUser ? user.photoURL : 
                     (user.photoURL || (user?.uid ? getEmojiAvatar(user.uid) : FALLBACK_PROFILE_IMAGE))}
                alt="Profile"
                className="user-avatar"
                onError={(e) => {
                  if (!user.isGoogleUser) {
                    e.target.src = user?.uid ? getEmojiAvatar(user.uid) : FALLBACK_PROFILE_IMAGE;
                  }
                }}
              />
            </div>
          </div>
        )}
        <div className="company-info">
          <h3 className="company-name">{user?.displayName || 'User'}</h3>
          <p className="company-category">{formatProfileType(user?.profileType)}</p>
        </div>
      </div>

      <div className="submission-items-list">
        {[...submissionItems]
          .sort((a, b) => {
            // Sort completed items to the top
            if (a.status === 'complete' && b.status !== 'complete') return -1;
            if (a.status !== 'complete' && b.status === 'complete') return 1;
            return 0;
          })
          .map((item) => (
            <button
              key={item.id}
              className="submission-item"
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