/**
 * HelpCenter Component
 * 
 * A comprehensive help center interface that provides:
 * - FAQ section with expandable questions
 * - Support options with contact methods
 * - Responsive side-by-side layout
 * - Interactive animations and transitions
 * - Real-time response time tracking
 * 
 * Layout Structure:
 * - Left Column: FAQ section with expandable items
 * - Right Column: Support options with contact buttons
 */

import React from 'react';

// Section component imports
import FAQ from './sections/FAQ/FAQ';           // FAQ accordion component
import Support from './sections/Support/Support'; // Support options component

// Styles import
import './HelpCenter.css';

const HelpCenter = () => {
  return (
    <div className="help-center-page">
      <div className="page-content">
        {/* Left Column - FAQ Section */}
        <div className="left-column">
          <FAQ />
        </div>

        {/* Right Column - Support Options */}
        <div className="right-column">
          <Support />
        </div>
      </div>
    </div>
  );
};

/**
 * Export the HelpCenter component
 * This component provides:
 * - Organized help content in FAQ format
 * - Multiple support contact options
 * - Responsive layout that stacks on mobile
 * - Smooth animations for better UX
 * - Real-time support status indicators
 */
export default HelpCenter; 