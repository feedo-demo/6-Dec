/**
 * Two-Step Authentication Section Component
 * Features:
 * - Enable/disable two-step authentication
 * - QR code generation for authenticator apps
 * - Backup codes management
 * - Security settings configuration
 */

import React, { useState } from 'react';
import { FiShield, FiSmartphone, FiKey } from 'react-icons/fi';
import './TwoStep.css';

const TwoStep = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  const NotificationToggle = ({ enabled, onClick }) => (
    <button 
      onClick={onClick}
      className={`toggle-button ${enabled ? 'active' : ''}`}
      aria-checked={enabled}
      role="switch"
    />
  );

  return (
    <div className="two-step-section">
      <h2 className="section-title">Two-Step Authentication</h2>
      
      <div className="two-step-content">
        <div className="security-status">
          <FiShield className={`status-icon ${isEnabled ? 'enabled' : 'disabled'}`} />
          <div className="status-info">
            <h3 className="status-title">Two-Step Authentication is {isEnabled ? 'Enabled' : 'Disabled'}</h3>
            <p className="status-description">
              Add an extra layer of security to your account by requiring a verification code in addition to your password.
            </p>
          </div>
          <NotificationToggle 
            enabled={isEnabled}
            onClick={() => setIsEnabled(!isEnabled)}
          />
        </div>

        {isEnabled && (
          <div className="authentication-options">
            <div className="auth-option">
              <FiSmartphone className="option-icon" />
              <div className="option-info">
                <h4>Authenticator App</h4>
                <p>Use an authenticator app to generate verification codes</p>
                <button className="setup-button">Set up authenticator</button>
              </div>
            </div>

            <div className="auth-option">
              <FiKey className="option-icon" />
              <div className="option-info">
                <h4>Backup Codes</h4>
                <p>Generate backup codes to use when you can't access your authenticator</p>
                <button className="setup-button">Generate backup codes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoStep; 