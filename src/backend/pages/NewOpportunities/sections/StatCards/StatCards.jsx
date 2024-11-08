/**
 * StatCards Component
 * 
 * Purpose: Displays key statistics in an visually appealing card layout
 * 
 * Features:
 * - Responsive grid layout that adapts to different screen sizes
 * - Animated number transitions using AnimatedNumber component
 * - Interactive hover effects with scale transform
 * - Gradient backgrounds for visual appeal
 * - Trend indicators for each statistic
 * - Icon-based visual indicators
 * 
 * Props: None (currently using static data)
 * 
 * Dependencies:
 * - react-icons/fi for Feather icons
 * - AnimatedNumber component for number animations
 * - StatCards.css for styling
 */

import React from 'react';
import { 
    FiFileText,    // Document icon representing total number of opportunities
    FiStar,        // Star icon representing perfect/ideal matches
    FiTrendingUp,  // Upward trend arrow showing success rate and growth
    FiClock        // Clock icon indicating time-sensitive or closing opportunities
} from 'react-icons/fi';
import AnimatedNumber from '../../../../components/Animated/AnimatedNumber';
import './StatCards.css';

/**
 * StatCards Component
 * @returns {JSX.Element} A grid of statistics cards
 */
const StatCards = () => {
  // Static data for statistics cards
  // Each object represents a card with its properties
  const stats = [
    {
      id: 1,
      icon: FiFileText,          // Document icon for total opportunities
      title: "Total Opportunities",
      value: 156,                // Current value to display
      trend: "+12%",             // Trend indicator
      bgColor: "bg-gradient-to-r from-blue-500 to-blue-600" // Tailwind gradient
    },
    {
      id: 2,
      icon: FiStar,              // Star icon for perfect matches
      title: "Perfect Matches",
      value: 28,
      trend: "+5%",
      bgColor: "bg-gradient-to-r from-green-500 to-green-600"
    },
    {
      id: 3,
      icon: FiTrendingUp,        // Trending icon for success rate
      title: "Success Rate",
      value: 85,
      trend: "+3%",
      bgColor: "bg-gradient-to-r from-purple-500 to-purple-600",
      isPercentage: true         // Flag to append % symbol
    },
    {
      id: 4,
      icon: FiClock,             // Clock icon for closing opportunities
      title: "Closing Soon",
      value: 12,
      trend: "2 days",
      bgColor: "bg-gradient-to-r from-orange-500 to-orange-600"
    }
  ];

  return (
    // Responsive grid container
    // - 1 column on mobile
    // - 2 columns on medium screens
    // - 4 columns on large screens
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Map through stats array to create individual cards */}
      {stats.map((stat) => (
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
            <AnimatedNumber value={stat.value} duration={2000} />
            {stat.isPercentage && '%'} {/* Conditionally render percentage symbol */}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatCards; 