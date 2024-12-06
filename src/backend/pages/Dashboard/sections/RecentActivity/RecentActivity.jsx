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
import SkeletonLoading from '../../../../../components/SkeletonLoading/SkeletonLoading';
import { db } from '../../../../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import useProfileProgress from '../../../../../hooks/useProfileProgress';

const RecentActivity = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { sections, getMissingSteps } = useProfileProgress();

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

        // Get missing steps
        const missingStepsData = getMissingSteps();
        const missingStepActivities = missingStepsData.sections.length > 0 ? [{
          id: missingStepsData.sections.length > 1 ? 'missing-multiple' : `missing-${missingStepsData.sections[0].id}`,
          type: missingStepsData.sections.length > 1 ? 'Missing Steps' : 'Missing Step',
          icon: missingStepsData.sections.length > 1 ? FiAlertCircle : getSectionIcon(missingStepsData.sections[0].id),
          description: missingStepsData.message,
          date: new Date(),
          color: 'text-orange-500',
          bgColor: 'bg-orange-50',
          link: `/data-management?tab=${missingStepsData.sections[0].id}`,
          targetTab: missingStepsData.sections[0].id
        }] : [];

        // Fetch both applications and opportunities
        const [applications, opportunities] = await Promise.all([
          applicationOperations.getUserApplications(user.profile.authUid),
          opportunityOperations.getOpportunities({ userId: user.profile.authUid })
        ]);

        // Format application notifications
        const applicationActivities = applications.slice(0, 2).map(app => ({
          id: `app-${app.id}`,
          icon: getStatusIcon(app.status),
          description: getApplicationStatusMessage(app),
          date: new Date(app.createdAt),
          color: getStatusColor(app.status),
          bgColor: getStatusBgColor(app.status),
          type: 'Application',
          link: '/my-applications'
        }));

        // Format opportunity notifications
        const opportunityActivities = opportunities.slice(0, 2).map(opp => ({
          id: `opp-${opp.id}`,
          icon: FiSun,
          description: `New opportunity: ${opp.title}`,
          date: new Date(opp.createdAt),
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          type: 'Opportunity',
          link: '/new-opportunities'
        }));

        // Combine all activities
        const allActivities = [
          ...missingStepActivities,
          ...applicationActivities,
          ...opportunityActivities
        ].sort((a, b) => b.date - a.date);

        setActivities(allActivities);
        setError(null);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('Failed to load recent activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user, sections]);

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

  // Add helper function to check section completion (same as DataSubmission)
  const checkSectionCompletion = (sectionId, user, questions) => {
    // If no user data or no profile sections, section is incomplete
    if (!user?.profileSections || !user.profileSections[sectionId]) {
      console.log(`Section ${sectionId} incomplete: No user data or section data`);
      return false;
    }

    const sectionData = user.profileSections[sectionId];
    
    // If no questions array in section data, section is incomplete
    if (!sectionData.questions || !Array.isArray(sectionData.questions)) {
      console.log(`Section ${sectionId} incomplete: No questions array in section data`);
      return false;
    }

    // If no questions in config, section is incomplete
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      console.log(`Section ${sectionId} incomplete: No questions in config`);
      return false;
    }

    // Get required questions from config
    const requiredQuestions = questions.filter(q => q.required);
    
    // For sections with no required questions, treat all questions as required
    // This ensures at least one question must be answered
    const questionsToCheck = requiredQuestions.length > 0 ? requiredQuestions : questions;
    
    // Check each question
    for (const question of questionsToCheck) {
      const questionData = sectionData.questions.find(q => q.id === question.id);
      
      // If question data doesn't exist or has no answer, section is incomplete
      if (!questionData || !questionData.answer) {
        console.log(`Section ${sectionId} incomplete: Missing answer for question ${question.id}`);
        return false;
      }

      // For repeater type questions
      if (question.type === 'repeater' && question.repeaterFields) {
        // If answer is not an array or is empty, section is incomplete
        if (!Array.isArray(questionData.answer) || questionData.answer.length === 0) {
          console.log(`Section ${sectionId} incomplete: Empty or invalid repeater answer for question ${question.id}`);
          return false;
        }

        // Check each repeater entry for fields
        const fieldsToCheck = question.repeaterFields.filter(field => field.required || requiredQuestions.length === 0);
        for (const entry of questionData.answer) {
          for (const field of fieldsToCheck) {
            if (!entry || !entry[field.id] || entry[field.id] === '') {
              console.log(`Section ${sectionId} incomplete: Missing field ${field.id} in question ${question.id}`);
              return false;
            }
          }
        }
      }
      // For non-repeater questions
      else {
        // Check for empty string, null, undefined, or empty array
        const isEmpty = 
          questionData.answer === '' || 
          questionData.answer === null || 
          questionData.answer === undefined ||
          (Array.isArray(questionData.answer) && (
            questionData.answer.length === 0 || 
            questionData.answer.every(a => a === null || a === undefined || a === '')
          ));

        if (isEmpty) {
          console.log(`Section ${sectionId} incomplete: Empty answer for question ${question.id}`);
          return false;
        }
      }
    }

    // If we get here, all checked questions have valid answers
    console.log(`Section ${sectionId} complete: All questions answered`);
    return true;
  };

  // Helper function to format section name
  const formatSectionName = (sectionId) => {
    return sectionId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to get appropriate icon for each section
  const getSectionIcon = (sectionId) => {
    const iconMap = {
      'personal': FiUser,
      'education': FiBook,
      'work-experience': FiBriefcase,
      'verification': FiShield,
      // Add more section mappings as needed
    };

    return iconMap[sectionId] || FiAlertCircle;
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
  const handleViewProfile = (activity) => {
    const tab = activity.targetTab || activity.link?.split('tab=')[1];
    navigate(`/data-management?tab=${tab}`);
  };

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
      case 'Opportunity':
        return {
          label: 'View',
          onClick: handleViewOpportunities,
          Icon
        };
      case 'Missing Step':
      case 'Missing Steps':
        return {
          label: 'Complete',
          onClick: () => handleViewProfile(activity),
          Icon
        };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="recent-activity">
        <div className="loading-state">
          <div className="loading-spinner"></div>
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

  return (
    <div className="recent-activity">
      <div className="activity-header">
        <h2 className="activity-title">Recent Activity</h2>
      </div>
      
      <div className="activity-list">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
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
          ))
        ) : (
          <div className="text-gray-500 text-center py-4">
            No recent activities
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;