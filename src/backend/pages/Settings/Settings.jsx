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

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Profile from './sections/Profile/Profile';
import Account from './sections/Account/Account';
import PaymentSection from './sections/Payment';
import Notification from './sections/Notification/Notification';
import TwoStepSection from './sections/TwoStep';
import './Settings.css';

const SettingsContent = () => {
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState('account');

  // Handle URL parameters for active section
  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      setActiveSection(section);
    }
  }, [searchParams]);

  const renderSection = () => {
    switch (activeSection) {
      case 'account':
        return <Account />;
      case 'payment':
        return <PaymentSection />;
      case 'notification':
        return <Notification />;
      case 'two-step':
        return <TwoStepSection />;
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