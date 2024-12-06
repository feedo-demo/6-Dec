/**
 * AdminLayout Component
 * 
 * Features:
 * - Consistent layout for admin pages
 * - Includes AdminSidebar
 * - Fixed header
 * - Responsive design
 */

import React from 'react';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout; 