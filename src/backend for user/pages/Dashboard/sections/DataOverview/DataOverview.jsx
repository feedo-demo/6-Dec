/**
 * DataOverview Component
 * 
 * A comprehensive data overview interface that provides:
 * - Animated data cards with statistics
 * - Interactive hover states
 * - Real-time data updates
 * - Detailed statistics for each category
 * - Responsive grid layout
 * 
 * Features:
 * - Animated number counters
 * - Progress tracking
 * - Interactive UI elements
 * - Hover effects
 * - Responsive design
 */

import React, { useState, useEffect } from 'react';
import { 
  FiFileText,     // For application metrics
  FiBriefcase,    // For opportunity metrics
  FiClock,        // For deadline metrics
  FiActivity,     // For active status
  FiLoader,       // For in-progress status
  FiAlertCircle,  // For alerts/warnings
  FiCheckCircle,  // For completed status
  FiGift,         // For grants
  FiTrendingUp    // For trends
} from 'react-icons/fi';
import './DataOverview.css';

const DataOverview = () => {
  /**
   * State Management
   * Tracks animated values for statistics
   */
  const [totalApps, setTotalApps] = useState(0);           // Total applications count
  const [opportunities, setOpportunities] = useState(0);    // Available opportunities
  const [deadlines, setDeadlines] = useState(0);           // Upcoming deadlines

  /**
   * Animation effect for statistics
   * Animates numbers from 0 to target value
   */
  useEffect(() => {
    /**
     * Animate value from 0 to target
     * @param {Function} setter - State setter function
     * @param {number} end - Target value
     * @param {number} duration - Animation duration in ms
     */
    const animateValue = (setter, end, duration) => {
      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          clearInterval(timer);
          setter(end);
        } else {
          setter(Math.floor(start));
        }
      }, 16);
    };

    // Initialize animations with different durations
    animateValue(setTotalApps, 67, 1000);
    animateValue(setOpportunities, 3, 1000);
    animateValue(setDeadlines, 23, 1000);
  }, []);

  /**
   * Card configuration array
   * Each card includes:
   * - Title and value
   * - Icon component
   * - Color scheme
   * - Detailed statistics
   */
  const cards = [
    {
      title: "Applications",
      value: totalApps,
      icon: FiFileText,
      color: "bg-[#00A3FF]",
      stats: [
        { label: "Active", value: "3", icon: FiActivity },
        { label: "In Progress", value: "1", icon: FiLoader },
        { label: "Approved", value: "1", icon: FiCheckCircle }
      ]
    },
    {
      title: "Opportunities",
      value: opportunities,
      icon: FiBriefcase,
      color: "bg-[#6E7E8E]",
      stats: [
        { label: "Opportunities", value: "3", icon: FiBriefcase },
        { label: "Grants", value: "1", icon: FiGift },
        { label: "Trends", value: "1", icon: FiTrendingUp }
      ]
    },
    {
      title: "Deadlines",
      value: deadlines,
      icon: FiClock,
      color: "bg-[#FF8541]",
      stats: [
        { label: "Application", value: "2", icon: FiFileText },
        { label: "Microsoft", value: "5", icon: FiBriefcase },
        { label: "Programs", value: "7", icon: FiTrendingUp }
      ]
    }
  ];

  return (
    <div className="data-overview">
      {/* Cards container with responsive grid */}
      <div className="overview-cards-container">
        {cards.map((card, index) => (
          <div key={index} className={`overview-card ${card.color}`}>
            {/* Card header with icon and action button */}
            <div className="card-header">
              <div className="icon-wrapper">
                <card.icon className="card-icon" />
              </div>
              <button className="view-more-btn">View More</button>
            </div>

            {/* Card content with title and value */}
            <div className="card-content">
              <h2 className="card-title text-white">{card.title}</h2>
              <span className="card-value">{card.value}</span>
            </div>

            {/* Detailed statistics container */}
            <div className="stats-container">
              {card.stats.map((stat, statIndex) => (
                <div key={statIndex} className="stats-row">
                  <div className="stats-row-content">
                    <stat.icon className="stats-row-icon" />
                    <span className="stats-row-label">{stat.label}</span>
                    <span className="stats-row-value">{stat.value}</span>
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

/**
 * Export the DataOverview component
 * This component provides:
 * - Visual statistics display
 * - Animated counters
 * - Interactive cards
 * - Detailed metrics
 * - Responsive layout
 */
export default DataOverview; 