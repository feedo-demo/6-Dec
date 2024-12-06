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
import { ToastProvider } from '../../../components/Toast/ToastContext';
import SubscriptionSection from './sections/SubscriptionSection';
import './Subscription.css';

const Subscription = () => {
  return (
    <ToastProvider>
      <div className="subscription-page">
        <SubscriptionSection />
      </div>
    </ToastProvider>
  );
};

export default Subscription; 