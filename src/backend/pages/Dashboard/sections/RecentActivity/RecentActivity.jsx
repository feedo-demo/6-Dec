/**
 * RecentActivity Component
 * 
 * A comprehensive activity tracking interface that provides:
 * - One recent item from each category
 * - Real-time activity feed from multiple sources
 * - Visual status indicators
 * - Interactive hover states
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSun,          // For new opportunities
  FiFileText,     // For submissions
  FiCheckCircle,  // For approvals
  FiAlertTriangle, // For incomplete items
  FiUser,         // For profile updates
  FiBook,         // For education updates
  FiBriefcase,    // For work experience
  FiShield,       // For verification
  FiAlertCircle,  // For follow-up
  FiArrowRight   // For the view all button
} from 'react-icons/fi';
import './RecentActivity.css';
import { useAuth } from '../../../../../auth/AuthContext';
import { applicationOperations, opportunityOperations } from '../../../../../applications/applicationManager';

const RecentActivity = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to get application status message
  const getApplicationStatusMessage = (application) => {
    switch (application.status) {
      case 'approved':
        return `Your application for ${application.name} was accepted`;
      case 'rejected':
        return `Your application for ${application.name} was rejected`;
      case 'pending':
        return `Your application for ${application.name} is under review`;
      case 'incomplete':
        return `Complete your application for ${application.name}`;
      case 'follow-up':
        return `Follow-up required for ${application.name}`;
      default:
        return `Applied to ${application.name}`;
    }
  };

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user?.profile?.authUid) return;

      try {
        setLoading(true);

        // Fetch both applications and opportunities
        const [applications, opportunities] = await Promise.all([
          applicationOperations.getUserApplications(user.profile.authUid),
          opportunityOperations.getOpportunities({ userId: user.profile.authUid })
        ]);

        // Format applications with status
        const applicationActivities = applications.slice(0, 2).map(app => ({
          id: `app-${app.id}`,
          type: 'Application',
          icon: getStatusIcon(app.status),
          description: getApplicationStatusMessage(app),
          date: new Date(app.createdAt),
          color: getStatusColor(app.status),
          bgColor: getStatusBgColor(app.status)
        }));

        // Format most recent opportunity
        const opportunityActivity = opportunities.length > 0 ? [{
          id: `opp-${opportunities[0].id}`,
          type: 'New Opportunity',
          icon: FiSun,
          description: opportunities[0].title,
          date: new Date(opportunities[0].createdAt),
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50'
        }] : [];

        // Get missing data step if any
        const missingStep = getMissingDataStep(user);
        const missingStepActivity = missingStep ? [missingStep] : [];

        // Combine all activities
        const combinedActivities = [
          ...applicationActivities,
          ...opportunityActivity,
          ...missingStepActivity
        ];

        // Sort by date and format dates
        const sortedActivities = combinedActivities
          .sort((a, b) => b.date - a.date)
          .map(activity => ({
            ...activity,
            date: formatDate(activity.date)
          }));

        setActivities(sortedActivities);
        setError(null);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('Failed to load recent activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user]);

  // Helper function to get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return FiCheckCircle;
      case 'rejected':
        return FiAlertTriangle;
      case 'pending':
        return FiFileText;
      case 'incomplete':
        return FiAlertTriangle;
      case 'follow-up':
        return FiAlertCircle;
      default:
        return FiFileText;
    }
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      case 'pending':
        return 'text-blue-500';
      case 'incomplete':
        return 'text-orange-500';
      case 'follow-up':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  // Helper function to get status background color
  const getStatusBgColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50';
      case 'rejected':
        return 'bg-red-50';
      case 'pending':
        return 'bg-blue-50';
      case 'incomplete':
        return 'bg-orange-50';
      case 'follow-up':
        return 'bg-yellow-50';
      default:
        return 'bg-gray-50';
    }
  };

  // Helper function to get status description
  const getStatusDescription = (status) => {
    switch (status) {
      case 'approved':
        return 'Application approved for';
      case 'rejected':
        return 'Application rejected for';
      case 'pending':
        return 'Application submitted to';
      default:
        return 'Applied to';
    }
  };

  // Helper function to get missing data step
  const getMissingDataStep = (user) => {
    if (!user?.profile?.professionalSummary) {
      return {
        id: 'missing-profile',
        type: 'Missing Step',
        icon: FiUser,
        description: 'Complete your professional summary',
        date: new Date(),
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        targetTab: 'personal'
      };
    }
    if (!user?.education?.degreeLevel) {
      return {
        id: 'missing-education',
        type: 'Missing Step',
        icon: FiBook,
        description: 'Add your education details',
        date: new Date(),
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
        targetTab: 'education'
      };
    }
    if (!user?.verification?.isVerified) {
      return {
        id: 'missing-verification',
        type: 'Missing Step',
        icon: FiShield,
        description: 'Complete your verification',
        date: new Date(),
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        targetTab: 'verification'
      };
    }
    return null;
  };

  // Format date helper function
  const formatDate = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const hours = Math.floor(diffTime / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diffTime / (1000 * 60));
        return `${minutes} minutes ago`;
      }
      return `${hours} hours ago`;
    }
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Navigation handlers
  const handleViewApplications = () => navigate('/my-applications');
  const handleViewOpportunities = () => navigate('/new-opportunities');
  const handleViewProfile = (targetTab) => navigate(`/data-management?tab=${targetTab}`);

  // Get button config based on activity type
  const getViewButton = (activity) => {
    const Icon = FiArrowRight; // Default icon
    
    switch (activity.type) {
      case 'Application':
        return {
          label: 'View',
          onClick: handleViewApplications,
          Icon
        };
      case 'New Opportunity':
        return {
          label: 'View',
          onClick: handleViewOpportunities,
          Icon
        };
      case 'Missing Step':
        return {
          label: 'Complete',
          onClick: () => handleViewProfile(activity.targetTab),
          Icon
        };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="recent-activity">
        <div className="activity-header">
          <h2 className="activity-title">Recent Activity</h2>
        </div>
        <div className="activity-list">
          {[1, 2, 3].map((index) => (
            <div key={index} className="activity-item animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recent-activity">
        <div className="activity-header">
          <h2 className="activity-title">Recent Activity</h2>
        </div>
        <div className="text-red-500 text-center py-4">
          {error}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="recent-activity">
        <div className="activity-header">
          <h2 className="activity-title">Recent Activity</h2>
        </div>
        <div className="text-gray-500 text-center py-4">
          No recent activities
        </div>
      </div>
    );
  }

  return (
    <div className="recent-activity">
      <div className="activity-header">
        <h2 className="activity-title">Recent Activity</h2>
      </div>
      
      <div className="activity-list">
        {activities.map((activity, index) => (
          <div 
            key={activity.id}
            className="activity-item"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`activity-icon-wrapper ${activity.bgColor}`}>
              <activity.icon className={`activity-icon ${activity.color}`} />
            </div>
            
            <div className="activity-content">
              <div className="activity-main">
                <span className="activity-type">{activity.type}:</span>
                <span className="activity-description">{activity.description}</span>
              </div>
              {getViewButton(activity) && (
                <button 
                  onClick={getViewButton(activity).onClick}
                  className="activity-view-btn"
                >
                  {getViewButton(activity).label}
                  <FiArrowRight className="inline ml-1" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;