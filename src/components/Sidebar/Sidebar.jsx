/**
 * Sidebar Component
 * 
 * Features:
 * - Navigation menu with icons
 * - Active state highlighting
 * - Bottom section with Settings, Help Center, and Logout
 * - Firebase authentication integration for logout
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  RiDashboardLine,
  RiAddCircleLine,
  RiDatabase2Line,
  RiSettings4Line,
  RiCustomerService2Line,
  RiLogoutBoxRLine,
  RiVipCrownLine
} from 'react-icons/ri';
import { FiFileText } from 'react-icons/fi';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const menuItems = [
    { path: '/dashboard', icon: RiDashboardLine, label: 'Dashboard' },
    { path: '/my-applications', icon: FiFileText, label: 'My Applications' },
    { path: '/new-opportunities', icon: RiAddCircleLine, label: 'New Opportunities' },
    { path: '/data-management', icon: RiDatabase2Line, label: 'Data Management' },
    { path: '/subscription', icon: RiVipCrownLine, label: 'Subscription' },
  ];

  const bottomMenuItems = [
    { path: '/settings', icon: RiSettings4Line, label: 'Settings' },
    { path: '/help-center', icon: RiCustomerService2Line, label: 'Help Center' },
  ];

  const isActive = (path) => location.pathname === path;

  // Add loading state
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoading(false);
    }
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col pt-16 animate-slideIn">
      <div className="flex-1 py-6">
        <nav className="space-y-1 px-3 pt-4">
          {menuItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${
                isActive(item.path)
                  ? 'bg-[#EEF5FF] text-[#246BFD] transform hover:translate-x-1'
                  : 'text-gray-700 hover:bg-gray-50 hover:translate-x-1'
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'slideInFromLeft 0.5s ease forwards'
              }}
            >
              <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:rotate-6 ${
                isActive(item.path) ? 'text-[#246BFD]' : 'text-gray-400'
              }`} />
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-200">
        <nav className="space-y-1">
          {bottomMenuItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:translate-x-1 hover:shadow-sm"
              style={{
                animationDelay: `${(menuItems.length + index) * 100}ms`,
                animation: 'slideInFromLeft 0.5s ease forwards'
              }}
            >
              <item.icon className="w-5 h-5 text-gray-400 transition-transform duration-300 group-hover:rotate-6" />
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
          
          {/* Logout Button */}
          <button
            className={`w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-all duration-300 hover:translate-x-1 hover:shadow-sm relative ${
              isLoading ? 'loading text-transparent' : ''
            }`}
            onClick={handleLogout}
            disabled={isLoading}
            style={{
              animationDelay: `${(menuItems.length + bottomMenuItems.length) * 100}ms`,
              animation: 'slideInFromLeft 0.5s ease forwards'
            }}
          >
            <RiLogoutBoxRLine className="w-5 h-5 transition-transform duration-300 group-hover:rotate-6" />
            <span className="ml-3">{isLoading ? '' : 'Logout'}</span>
            {isLoading && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </button>
        </nav>

        {/* Version Number with fade-in animation */}
        <div 
          className="px-4 mt-6 text-xs text-gray-400 animate-fadeIn"
          style={{ animationDelay: '800ms' }}
        >
          Version 1.2.0
        </div>
      </div>
    </aside>
  );
};

// Add these styles to your global CSS or create a new Sidebar.css file
const styles = `
  @keyframes slideInFromLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .animate-slideIn {
    animation: slideInFromLeft 0.5s ease forwards;
  }

  .animate-fadeIn {
    animation: fadeIn 0.5s ease forwards;
  }
`;

// Add the styles to the document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default Sidebar; 