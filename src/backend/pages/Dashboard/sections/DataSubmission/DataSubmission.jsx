/**
 * DataSubmission Component
 * 
 * A comprehensive data submission tracking interface that provides:
 * - Real-time progress tracking for each data section
 * - Dynamic status updates based on form completion
 * - Visual progress indicators
 * - Interactive submission items
 * 
 * Features:
 * - Integration with DataManagement tabs
 * - Real-time progress calculation
 * - Status tracking per section
 * - Visual feedback
 */

import React, { useState, useEffect } from 'react';
import { FiAlertCircle, FiCheckCircle, FiChevronRight } from 'react-icons/fi';
import './DataSubmission.css';
import { FALLBACK_PROFILE_IMAGE, getEmojiAvatar } from '../../../../constants/profileData';
import { useAuth } from '../../../../../auth/AuthContext';

const DataSubmission = () => {
  const { user, loading: authLoading } = useAuth();
  const [progress, setProgress] = useState(0);
  const [submissionItems, setSubmissionItems] = useState([
    {
      id: 1,
      type: 'Personal Data',
      status: 'incomplete',
      label: 'Complete Now',
      isNew: false,
      requiredFields: ['fullName', 'email', 'phoneNumber', 'location', 'professionalSummary']
    },
    {
      id: 2,
      type: 'Education Data',
      status: 'incomplete',
      label: 'Complete Now',
      requiredFields: ['degreeLevel', 'fieldOfStudy', 'institutionName', 'graduationDate']
    },
    {
      id: 3,
      type: 'Work Experience',
      status: 'incomplete',
      label: 'Complete Now',
      isNew: true,
      requiredFields: ['companyName', 'jobTitle', 'startDate', 'responsibilities']
    },
    {
      id: 4,
      type: 'Verification',
      status: 'incomplete',
      label: 'Complete Now',
      isNew: false,
      requiredFields: ['verificationCode', 'termsAccepted']
    }
  ]);

  // Calculate completion status for each section
  useEffect(() => {
    if (user) {
      const updatedItems = submissionItems.map(item => {
        let isComplete = false;

        switch (item.type) {
          case 'Personal Data':
            isComplete = checkPersonalDataCompletion();
            break;
          case 'Education Data':
            isComplete = checkEducationDataCompletion();
            break;
          case 'Work Experience':
            isComplete = checkWorkExperienceCompletion();
            break;
          case 'Verification':
            isComplete = checkVerificationCompletion();
            break;
          default:
            break;
        }

        return {
          ...item,
          status: isComplete ? 'complete' : 'incomplete',
          label: isComplete ? 'Completed' : 'Complete Now'
        };
      });

      setSubmissionItems(updatedItems);

      // Calculate overall progress
      const completedSections = updatedItems.filter(item => item.status === 'complete').length;
      const totalSections = updatedItems.length;
      const calculatedProgress = Math.round((completedSections / totalSections) * 100);
      setProgress(calculatedProgress);
    }
  }, [user]);

  // Check completion status for each section
  const checkPersonalDataCompletion = () => {
    if (!user?.profile) return false;
    
    const requiredFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'location', 'professionalSummary'];
    return requiredFields.every(field => {
      const value = user.profile[field];
      return value && value.toString().trim() !== '';
    });
  };

  const checkEducationDataCompletion = () => {
    if (!user?.education) return false;
    
    const requiredFields = ['degreeLevel', 'fieldOfStudy', 'institutionName', 'graduationDate'];
    return requiredFields.every(field => {
      const value = user.education[field];
      return value && value.toString().trim() !== '';
    });
  };

  const checkWorkExperienceCompletion = () => {
    if (!user?.workExperience || !user.workExperience.length) return false;
    
    const requiredFields = ['companyName', 'jobTitle', 'startDate', 'responsibilities'];
    return user.workExperience.some(exp => 
      requiredFields.every(field => {
        const value = exp[field];
        return value && value.toString().trim() !== '';
      })
    );
  };

  const checkVerificationCompletion = () => {
    return user?.verification?.isVerified === true;
  };

  // Updated formatProfileType function to include color styling
  const formatProfileType = (type) => {
    if (!type) return '';
    
    // Convert jobseeker to Job Seeker, etc.
    const formattedType = type
      .split(/(?=[A-Z])|_/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    // Return with color styling
    return (
      <span className={`profile-status ${type.toLowerCase()}`}>
        {formattedType}
      </span>
    );
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
                src={getProfileImage()}
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
        )}
        <div className="company-info">
          <h3 className="company-name">
            {user?.profile?.firstName ? 
              `${user.profile.firstName} ${user.profile.lastName || ''}` : 
              'User'
            }
          </h3>
          <p className="company-category">
            {formatProfileType(user?.profile?.userType)}
          </p>
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