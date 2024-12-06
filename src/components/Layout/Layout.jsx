/**
 * Layout Component
 * 
 * Features:
 * - Consistent layout wrapper for all backend pages
 * - Includes DashboardHeader and Sidebar
 * - Handles proper content positioning
 */

import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import DashboardHeader from '../Header/DashboardHeader';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed w-full z-20">
        <DashboardHeader />
      </div>
      
      {/* Sidebar - Fixed width and position */}
      <div className="fixed w-64 h-screen flex-shrink-0">
        <Sidebar />
      </div>
      
      {/* Main Content - Adjusted margin to account for fixed sidebar */}
      <div className="flex-1 ml-64">
        <main className="mt-16 pb-16">
          <div className="relative px-6 pt-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 