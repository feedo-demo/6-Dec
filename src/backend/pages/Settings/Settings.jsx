/**
 * Settings Page Component
 * Features:
 * - User profile settings
 * - Account preferences
 * - Payment settings
 * - Notification settings
 * - Privacy controls
 * - Two-Step Authentication
 */

import React, { useState } from 'react';
import Profile from './sections/Profile/Profile';
import Account from './sections/Account/Account';
import Payment from './sections/Payment/Payment';
import Notification from './sections/Notification/Notification';
import TwoStep from './sections/TwoStep/TwoStep';
import './Settings.css';

const SettingsContent = () => {
  const [activeSection, setActiveSection] = useState('account');

  const renderSection = () => {
    switch (activeSection) {
      case 'account':
        return <Account />;
      case 'payment':
        return <Payment />;
      case 'notification':
        return <Notification />;
      case 'two-step':
        return <TwoStep />;
      default:
        return <Account />;
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-content">
        <div className="settings-layout">
          <Profile 
            activeSection={activeSection} 
            onSectionChange={setActiveSection} 
          />
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

const Settings = () => {
  return <SettingsContent />;
};

export default Settings; 