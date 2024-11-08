/**
 * Notification Settings Section Component
 * Features:
 * - Email notification preferences
 * - Push notification settings
 * - Notification categories management
 * - Custom notification schedules
 */

import React, { useState } from 'react';
import { 
  FiBell, 
  FiMail, 
  FiMessageSquare, 
  FiFileText, 
  FiHeart, 
  FiClock
} from 'react-icons/fi';
import './Notification.css';

const Notification = () => {
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    categories: {
      jobs: true,
      applications: true,
      messages: true,
      marketing: false,
      security: true
    },
    schedule: {
      instant: true,
      daily: false,
      weekly: false
    }
  });

  const handleToggle = (category, subcategory = null) => {
    setNotifications(prev => {
      if (subcategory) {
        return {
          ...prev,
          [category]: {
            ...prev[category],
            [subcategory]: !prev[category][subcategory]
          }
        };
      }
      return {
        ...prev,
        [category]: !prev[category]
      };
    });
  };

  const NotificationToggle = ({ enabled, onClick }) => (
    <button 
      onClick={onClick}
      className={`toggle-button ${enabled ? 'active' : ''}`}
      aria-checked={enabled}
      role="switch"
    />
  );

  return (
    <div className="notification-section">
      <h2 className="section-title">
        <FiBell className="section-icon" />
        Notification Settings
      </h2>

      {/* General Notification Settings */}
      <div className="notification-group">
        <h3 className="subsection-title">General Settings</h3>
        
        <div className="settings-list">
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">
                <FiMail />
              </div>
              <div className="setting-details">
                <h4>Email Notifications</h4>
                <p>Receive notifications via email</p>
              </div>
            </div>
            <NotificationToggle 
              enabled={notifications.emailNotifications}
              onClick={() => handleToggle('emailNotifications')}
            />
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">
                <FiBell />
              </div>
              <div className="setting-details">
                <h4>Push Notifications</h4>
                <p>Receive notifications in your browser</p>
              </div>
            </div>
            <NotificationToggle 
              enabled={notifications.pushNotifications}
              onClick={() => handleToggle('pushNotifications')}
            />
          </div>
        </div>
      </div>

      {/* Notification Categories */}
      <div className="notification-group">
        <h3 className="subsection-title">Notification Categories</h3>
        
        <div className="settings-list">
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">
                <FiHeart />
              </div>
              <div className="setting-details">
                <h4>New Job Matches</h4>
                <p>When new jobs match your preferences</p>
              </div>
            </div>
            <NotificationToggle 
              enabled={notifications.categories.jobs}
              onClick={() => handleToggle('categories', 'jobs')}
            />
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">
                <FiFileText />
              </div>
              <div className="setting-details">
                <h4>Application Updates</h4>
                <p>Status changes and updates to your applications</p>
              </div>
            </div>
            <NotificationToggle 
              enabled={notifications.categories.applications}
              onClick={() => handleToggle('categories', 'applications')}
            />
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">
                <FiMessageSquare />
              </div>
              <div className="setting-details">
                <h4>Messages</h4>
                <p>When you receive new messages</p>
              </div>
            </div>
            <NotificationToggle 
              enabled={notifications.categories.messages}
              onClick={() => handleToggle('categories', 'messages')}
            />
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon security">
                <FiBell />
              </div>
              <div className="setting-details">
                <h4>Security Alerts</h4>
                <p>Important security-related notifications</p>
              </div>
            </div>
            <NotificationToggle 
              enabled={notifications.categories.security}
              onClick={() => handleToggle('categories', 'security')}
            />
          </div>
        </div>
      </div>

      {/* Notification Schedule */}
      <div className="notification-group">
        <h3 className="subsection-title">Delivery Schedule</h3>
        
        <div className="settings-list">
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">
                <FiClock />
              </div>
              <div className="setting-details">
                <h4>Instant Notifications</h4>
                <p>Receive notifications as they happen</p>
              </div>
            </div>
            <NotificationToggle 
              enabled={notifications.schedule.instant}
              onClick={() => handleToggle('schedule', 'instant')}
            />
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">
                <FiClock />
              </div>
              <div className="setting-details">
                <h4>Daily Digest</h4>
                <p>Receive a daily summary of notifications</p>
              </div>
            </div>
            <NotificationToggle 
              enabled={notifications.schedule.daily}
              onClick={() => handleToggle('schedule', 'daily')}
            />
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-icon">
                <FiClock />
              </div>
              <div className="setting-details">
                <h4>Weekly Digest</h4>
                <p>Receive a weekly summary of notifications</p>
              </div>
            </div>
            <NotificationToggle 
              enabled={notifications.schedule.weekly}
              onClick={() => handleToggle('schedule', 'weekly')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification; 