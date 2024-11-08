/**
 * Dashboard Page Component
 * 
 * Main dashboard interface that combines multiple sections:
 * - DataOverview: Shows key metrics and statistics
 * - RecentActivity: Displays user's recent actions and updates
 * - DataSubmission: Handles user data submission and progress
 * 
 * Features:
 * - Modular section-based layout
 * - Real-time data updates
 * - Interactive components
 * - Responsive design
 */

import React from 'react';

// Section imports
import DataSubmission from './sections/DataSubmission/DataSubmission';
import DataOverview from './sections/DataOverview/DataOverview';
import RecentActivity from './sections/RecentActivity/RecentActivity';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      {/* Data overview section - Shows key metrics and statistics */}
      <DataOverview />

      {/* Recent activity section - Shows user's latest actions */}
      <RecentActivity />

      {/* Data submission section - Handles user data input */}
      <DataSubmission />
    </div>
  );
};

export default Dashboard;