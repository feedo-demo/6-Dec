/**
 * DataManagement Component
 * 
 * A comprehensive data management interface with the following features:
 * - Tabbed navigation for different data sections
 * - Personal information management
 * - Educational details
 * - Additional information
 * - Verification process
 * - Progress tracking with DataSubmission component
 */

import React, { useState } from 'react';

// Icon imports for tab navigation
import { 
  FiUser,     // Personal tab icon
  FiBook,     // Education tab icon
  FiFileText, // Additional tab icon
  FiShield    // Verification tab icon
} from 'react-icons/fi';

// Tab section component imports
import Personal from './sections/TabsSection/Personal';
import Education from './sections/TabsSection/Education';
import Additional from './sections/TabsSection/Additional';
import Verification from './sections/TabsSection/Verification';

// Reusable component imports
import DataSubmission from '../Dashboard/sections/DataSubmission/DataSubmission';

// Styles import
import './DataManagement.css';

const DataManagement = () => {
  // Active tab state management
  const [activeTab, setActiveTab] = useState('Personal');

  /**
   * Tab configuration array
   * Defines the available tabs in the interface
   */
  const tabs = ['Personal', 'Education', 'Additional', 'Verification'];

  /**
   * Icon mapping object
   * Maps each tab to its corresponding icon component
   */
  const tabIcons = {
    Personal: <FiUser className="w-4 h-4" />,
    Education: <FiBook className="w-4 h-4" />,
    Additional: <FiFileText className="w-4 h-4" />,
    Verification: <FiShield className="w-4 h-4" />
  };

  /**
   * Render appropriate content based on active tab
   * @returns {JSX.Element} The component for the active tab
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Personal':
        return <Personal />;
      case 'Education':
        return <Education />;
      case 'Additional':
        return <Additional />;
      case 'Verification':
        return <Verification />;
      default:
        return null;
    }
  };

  return (
    <div className="data-management">
      {/* Main content area */}
      <main className="main-content">
        {/* Tab navigation */}
        <nav className="tab-nav">
          {tabs.map(tabId => (
            <button
              key={tabId}
              className={`tab-button ${activeTab === tabId ? 'active' : ''}`}
              onClick={() => setActiveTab(tabId)}
            >
              {tabIcons[tabId]}
              {tabId}
            </button>
          ))}
        </nav>

        {/* Tab content container */}
        <div className="tab-content-container">
          {renderTabContent()}
        </div>
      </main>

      {/* Progress tracking sidebar */}
      <DataSubmission />
    </div>
  );
};

/**
 * Export the DataManagement component
 * This component provides:
 * - Tabbed interface for data management
 * - Progress tracking
 * - Form validation
 * - Data persistence
 * - Responsive design
 */
export default DataManagement; 