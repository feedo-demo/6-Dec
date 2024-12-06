/**
 * StatCards Component
 * 
 * Purpose: Displays key statistics in an visually appealing card layout
 * 
 * Features:
 * - Real-time stats from Firestore
 * - Animated number transitions
 * - Interactive hover effects
 * - Gradient backgrounds
 */

import React, { useState, useEffect } from 'react';
import { 
    FiFileText,    // Total opportunities
    FiStar,        // Perfect matches
    FiTrendingUp,  // Success rate
    FiClock        // Closing soon
} from 'react-icons/fi';
import AnimatedNumber from '../../../../../components/Animated/AnimatedNumber';
import { opportunityOperations } from '../../../../../applications/applicationManager';
import './StatCards.css';
import { useAuth } from '../../../../../auth/AuthContext';

const StatCards = ({ refreshTrigger = 0 }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    perfectMatches: 0,
    successRate: 0,
    closingSoon: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch stats when component mounts or refreshTrigger changes
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.profile?.authUid) return;
      
      try {
        setLoading(true);  // Show loading state while refreshing
        const statsData = await opportunityOperations.getOpportunityStats(user.profile.authUid);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [refreshTrigger, user?.profile?.authUid]);  // Add user.profile.authUid to dependencies

  // Stats configuration with real data
  const statsConfig = [
    {
      id: 1,
      icon: FiFileText,
      title: "Total Opportunities",
      value: stats.total,
      trend: "+12%",
      bgColor: "bg-gradient-to-r from-blue-500 to-blue-600"
    },
    {
      id: 2,
      icon: FiStar,
      title: "Perfect Matches",
      value: stats.perfectMatches,
      trend: `${((stats.perfectMatches / stats.total) * 100).toFixed(1)}%`,
      bgColor: "bg-gradient-to-r from-green-500 to-green-600"
    },
    {
      id: 3,
      icon: FiTrendingUp,
      title: "Success Rate",
      value: stats.successRate,
      trend: "+3%",
      bgColor: "bg-gradient-to-r from-purple-500 to-purple-600",
      isPercentage: true
    },
    {
      id: 4,
      icon: FiClock,
      title: "Closing Soon",
      value: stats.closingSoon,
      trend: "Next 7 days",
      bgColor: "bg-gradient-to-r from-orange-500 to-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsConfig.map((stat) => (
        <div
          key={stat.id}
          className={`${stat.bgColor} rounded-xl p-6 text-white transition-all duration-300 hover:scale-105`}
        >
          {/* Card header with icon and trend indicator */}
          <div className="flex justify-between items-start mb-4">
            <stat.icon className="w-6 h-6 opacity-80" />
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
              {stat.trend}
            </span>
          </div>
          
          {/* Card title */}
          <h3 className="text-lg font-medium mb-2">{stat.title}</h3>
          
          {/* Animated value display */}
          <p className="text-3xl font-bold">
            {loading ? (
              <span className="animate-pulse">...</span>
            ) : (
              <>
                <AnimatedNumber value={stat.value} duration={2000} />
                {stat.isPercentage && '%'}
              </>
            )}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatCards; 