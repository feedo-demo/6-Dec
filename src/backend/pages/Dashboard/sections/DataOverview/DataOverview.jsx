/**
 * DataOverview Component
 * 
 * A comprehensive data overview interface that provides:
 * - Real-time statistics from applications and opportunities
 * - Interactive hover states
 * - Animated counters
 * - Visual feedback
 */

import React, { useState, useEffect } from 'react';
import { 
  FiFileText,     // For application metrics
  FiBriefcase,    // For opportunity metrics
  FiClock,        // For deadline metrics and last updated
  FiActivity,     // For active status
  FiLoader,       // For in-progress status
  FiAlertCircle,  // For alerts/warnings
  FiCheckCircle,  // For completed status
  FiGift,         // For grants
  FiTrendingUp,   // For trends
  FiUser,         // For profile overview
  FiShield,       // For verification status
  FiX,            // For never updated status
  FiClock as FiPending  // For pending status (aliased to avoid duplicate)
} from 'react-icons/fi';
import './DataOverview.css';
import { useAuth } from '../../../../../auth/AuthContext';
import { applicationOperations, opportunityOperations } from '../../../../../applications/applicationManager';
import { useNavigate } from 'react-router-dom';

const DataOverview = () => {
  const navigate = useNavigate();

  // Helper function to format date
  const formatDate = (date) => {
    if (!date) return 'Never';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Never';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Helper function to calculate profile completion stats
  const calculateProfileStats = (user) => {
    let completedSections = 0;
    const totalSections = 4; // Personal, Education, Work Experience, Verification

    // Check Personal Data completion
    if (user?.profile?.firstName && 
        user?.profile?.lastName && 
        user?.profile?.email && 
        user?.profile?.phoneNumber && 
        user?.profile?.location && 
        user?.profile?.professionalSummary) {
      completedSections++;
    }

    // Check Education completion
    if (user?.education?.degreeLevel && 
        user?.education?.fieldOfStudy && 
        user?.education?.institutionName && 
        user?.education?.graduationDate) {
      completedSections++;
    }

    // Check Work Experience completion
    if (user?.workExperience?.length > 0) {
      completedSections++;
    }

    // Check Verification completion
    if (user?.verification?.isVerified) {
      completedSections++;
    }

    return {
      completionRate: Math.round((completedSections / totalSections) * 100),
      completedSections,
      totalSections,
      verificationStatus: user?.verification?.isVerified || false
    };
  };

  const { user } = useAuth();
  const [stats, setStats] = useState({
    applications: {
      total: 0,
      pending: 0,
      incomplete: 0,
      approved: 0,
      rejected: 0,
      followUp: 0
    },
    opportunities: {
      total: 0,
      active: 0,
      perfectMatches: 0,
      closingSoon: 0
    },
    profile: {
      completionRate: 0,
      completedSections: 0,
      totalSections: 4,
      verificationStatus: false
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.profile?.authUid) return;

      try {
        setLoading(true);
        
        // Fetch both applications and opportunities stats
        const [applicationsStats, opportunitiesStats] = await Promise.all([
          applicationOperations.getApplicationStats(user.profile.authUid),
          opportunityOperations.getOpportunityStats(user.profile.authUid)
        ]);

        console.log('Fetched opportunity stats:', opportunitiesStats); // Debug log

        // Calculate profile completion stats
        const profileStats = calculateProfileStats(user);

        setStats({
          applications: {
            total: applicationsStats.total || 0,
            pending: applicationsStats.pending || 0,
            incomplete: applicationsStats.incomplete || 0,
            approved: applicationsStats.approved || 0,
            rejected: applicationsStats.rejected || 0,
            followUp: applicationsStats.followUp || 0
          },
          opportunities: {
            total: opportunitiesStats.total || 0,
            active: opportunitiesStats.active || 0,
            perfectMatches: opportunitiesStats.perfectMatches || 0,
            closingSoon: opportunitiesStats.closingSoon || 0
          },
          profile: profileStats
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setStats(prevStats => ({...prevStats}));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  // Helper function to format verification status
  const formatVerificationStatus = (isVerified) => {
    if (isVerified) {
      return {
        icon: FiCheckCircle,
        text: 'Verified',
        color: 'text-green-500'
      };
    }
    return {
      icon: FiPending,
      text: 'Pending',
      color: 'text-yellow-500'
    };
  };

  // Helper function to format last updated
  const formatLastUpdated = (date) => {
    if (!date) {
      return {
        icon: FiX,
        text: 'Never',
        color: 'text-gray-400'
      };
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return {
        icon: FiX,
        text: 'Never',
        color: 'text-gray-400'
      };
    }
    return {
      icon: FiClock,
      text: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      color: 'text-blue-500'
    };
  };

  // Add navigation handlers
  const handleViewApplications = () => navigate('/my-applications');
  const handleViewOpportunities = () => navigate('/new-opportunities');
  const handleViewProfile = () => navigate('/data-management');

  // Card configuration with real data and null checks
  const cards = [
    {
      title: "Applications",
      value: stats.applications.total,
      icon: FiFileText,
      color: "bg-[#00A3FF]",
      onViewMore: handleViewApplications,
      stats: [
        { 
          label: "Pending", 
          value: stats.applications.pending || 0, 
          icon: FiLoader 
        },
        { 
          label: "Incomplete", 
          value: stats.applications.incomplete || 0, 
          icon: FiAlertCircle 
        },
        { 
          label: "Approved", 
          value: stats.applications.approved || 0, 
          icon: FiCheckCircle 
        }
      ]
    },
    {
      title: "Opportunities",
      value: stats.opportunities.total,
      icon: FiBriefcase,
      color: "bg-[#6E7E8E]",
      onViewMore: handleViewOpportunities,
      stats: [
        { 
          label: "Active", 
          value: stats.opportunities.active || 0, 
          icon: FiActivity 
        },
        { 
          label: "Perfect Match", 
          value: stats.opportunities.perfectMatches || 0,
          icon: FiCheckCircle 
        },
        { 
          label: "Closing Soon", 
          value: stats.opportunities.closingSoon || 0,
          icon: FiClock 
        }
      ]
    },
    {
      title: "Overview",
      value: `${stats.profile.completionRate}%`,
      icon: FiUser,
      color: "bg-[#9C27B0]",
      onViewMore: handleViewProfile,
      stats: [
        { 
          label: "Profile Progress",
          value: `${stats.profile.completedSections}/${stats.profile.totalSections}`,
          icon: FiTrendingUp,
          customColor: 'text-blue-500'
        },
        { 
          label: "Completed",
          value: `${stats.profile.completedSections}`,
          icon: FiCheckCircle,
          customColor: 'text-green-500'
        },
        { 
          label: "Remaining",
          value: `${stats.profile.totalSections - stats.profile.completedSections}`,
          icon: FiAlertCircle,
          customColor: 'text-orange-500'
        }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="data-overview">
        <div className="overview-cards-container">
          {[1, 2, 3].map((index) => (
            <div key={index} className="overview-card bg-gray-100 animate-pulse">
              {/* Loading skeleton */}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="data-overview">
        <div className="text-red-500 text-center py-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="data-overview">
      <div className="overview-cards-container">
        {cards.map((card, index) => (
          <div key={index} className={`overview-card ${card.color}`}>
            <div className="card-header">
              <div className="icon-wrapper">
                <card.icon className="card-icon" />
              </div>
              <button 
                className="view-more-btn"
                onClick={card.onViewMore}
              >
                View More
              </button>
            </div>

            <div className="card-content">
              <h2 className="card-title text-white">{card.title}</h2>
              <span className="card-value">{card.value || 0}</span>
            </div>

            <div className="stats-container">
              {card.stats.map((stat, statIndex) => (
                <div key={statIndex} className="stats-row">
                  <div className="stats-row-content">
                    <stat.icon className={`stats-row-icon ${stat.customColor || ''}`} />
                    <span className="stats-row-label">{stat.label}</span>
                    <span className={`stats-row-value ${stat.customColor || ''}`}>{stat.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataOverview; 