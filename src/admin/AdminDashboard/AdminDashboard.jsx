/**
 * AdminDashboard Component
 * 
 * Features:
 * - Welcoming message
 * - Time-based greeting
 * - Motivational quote
 * - Clean and friendly design
 */

import React from 'react';
import { FiSun, FiMoon, FiSunrise } from 'react-icons/fi';
import { useAdminAuth } from '../AdminAuth/AdminAuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { adminUser } = useAdminAuth();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: FiSunrise };
    if (hour < 18) return { text: 'Good Afternoon', icon: FiSun };
    return { text: 'Good Evening', icon: FiMoon };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const getRandomQuote = () => {
    const quotes = [
      "Today is a great day to make a difference!",
      "Your dedication makes our platform better every day.",
      "Small steps lead to big changes.",
      "Together, we're building something amazing!",
      "Your work matters and impacts many lives."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  return (
    <div className="admin-dashboard">
      <div className="welcome-card">
        <div className="welcome-header">
          <GreetingIcon className="greeting-icon" />
          <div className="welcome-text">
            <h1>{greeting.text}, Admin!</h1>
            <p className="admin-email">{adminUser?.email}</p>
          </div>
        </div>
        
        <div className="welcome-message">
          <p className="message-text">Welcome to your dashboard! We're glad to have you here.</p>
          <p className="daily-quote">{getRandomQuote()}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 