/**
 * Subscription Page Component
 * 
 * Features:
 * - Main container for subscription functionality
 * - Imports and renders the SubscriptionSection component
 * - Handles layout and structure for subscription page
 * - Prepared for additional subscription-related sections
 */

import React from 'react';
import SubscriptionSection from './sections/SubscriptionSection';
import './Subscription.css';

const Subscription = () => {
  return (
    <div className="subscription-page">
      <SubscriptionSection />
    </div>
  );
};

export default Subscription; 