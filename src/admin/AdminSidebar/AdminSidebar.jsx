/**
 * AdminSidebar Component
 * 
 * Features:
 * - Navigation links
 * - Active link highlighting
 * - Logout functionality
 * - Responsive design
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiLogOut, FiDatabase } from 'react-icons/fi';
import { useAdminAuth } from '../AdminAuth/AdminAuthContext';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const { adminLogout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await adminLogout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h2>Admin Portal</h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/admin/questions"
          className={({ isActive }) => 
            `nav-item ${isActive ? 'active' : ''}`
          }
        >
          <FiDatabase className="nav-icon" />
          <span>Questions</span>
        </NavLink>
      </nav>
      
      <button 
        onClick={handleLogout}
        className="sidebar-logout-button"
      >
        <FiLogOut className="logout-icon" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default AdminSidebar; 