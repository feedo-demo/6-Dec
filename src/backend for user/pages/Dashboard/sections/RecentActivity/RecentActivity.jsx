/**
 * RecentActivity Component
 * 
 * A comprehensive activity tracking interface that provides:
 * - List of recent user activities
 * - Activity type categorization
 * - Visual status indicators
 * - Interactive hover states
 * - Animated entrance effects
 * 
 * Features:
 * - Staggered animation on load
 * - Interactive hover effects
 * - Status-based color coding
 * - View all functionality
 * - Responsive design
 */

import React from 'react';
import { 
  FiSun,          // For new opportunities
  FiFileText,     // For submissions
  FiCheckCircle,  // For approvals
  FiAlertTriangle // For incomplete items
} from 'react-icons/fi';
import './RecentActivity.css';

const RecentActivity = () => {
  /**
   * Activity configuration array
   * Each activity includes:
   * - Unique identifier
   * - Activity type
   * - Icon component
   * - Description text
   * - Timestamp
   * - Color scheme
   * - Background color
   */
  const activities = [
    {
      id: 1,
      type: 'New Opportunity',
      icon: FiSun,
      description: 'Grant ABC add',
      date: 'Oct 6, 2024',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 2,
      type: 'Submission',
      icon: FiFileText,
      description: 'applied to Startup Competition 2024',
      date: 'Oct 6, 2024',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      id: 3,
      type: 'Approved',
      icon: FiCheckCircle,
      description: 'Digital Sponsorship Grant approved',
      date: 'Oct 6, 2024',
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      id: 4,
      type: 'Incomplete Profile',
      icon: FiAlertTriangle,
      description: 'Missing pitch deck',
      date: 'Oct 6, 2024',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="recent-activity">
      {/* Section header */}
      <div className="activity-header">
        <h2 className="activity-title">Recent Activity</h2>
      </div>
      
      {/* Activity list with staggered animation */}
      <div className="activity-list">
        {activities.map((activity, index) => (
          <div 
            key={activity.id}
            className="activity-item"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Activity icon with background */}
            <div className={`activity-icon-wrapper ${activity.bgColor}`}>
              <activity.icon className={`activity-icon ${activity.color}`} />
            </div>
            
            {/* Activity content */}
            <div className="activity-content">
              <div className="activity-main">
                <span className="activity-type">{activity.type}:</span>
                <span className="activity-description">{activity.description}</span>
              </div>
              <span className="activity-date">({activity.date})</span>
            </div>
            
            {/* View all button */}
            <button className="view-all-btn">
              <span>View All</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Export the RecentActivity component
 * This component provides:
 * - Activity tracking display
 * - Visual status indicators
 * - Animated entrance effects
 * - Interactive elements
 * - Responsive design
 */
export default RecentActivity; 