/**
 * DashboardHeader Component with enhanced interactivity
 */

import React, { useState, useRef, useEffect } from 'react';
import { FiBell, FiSearch, FiMessageSquare, FiFileText, FiHeart, FiTrendingUp, FiSettings, FiLogOut } from 'react-icons/fi';
import logo from '../../assets/logo.png';
import './DashboardHeader.css';
import { FALLBACK_PROFILE_IMAGE, getEmojiAvatar } from '../../constants/profileData';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext';

const DashboardHeader = () => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsDropdownOpen, setIsNotificationsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      icon: FiMessageSquare,
      content: "New job match: Senior React Developer at Google",
      time: "2 minutes ago",
      isUnread: true
    },
    {
      id: 2,
      icon: FiFileText,
      content: "Your application for Frontend Developer at Meta was viewed",
      time: "1 hour ago",
      isUnread: true
    },
    {
      id: 3,
      icon: FiHeart,
      content: "New job alert: UI/UX Designer at Apple matches your profile",
      time: "3 hours ago",
      isUnread: true
    }
  ]);

  // Refs for dropdown containers
  const searchRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  const navigate = useNavigate();
  
  // Use AuthContext instead of direct Firebase auth
  const { user, loading, signOut } = useAuth();

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close search dropdown if click is outside
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      // Close notifications dropdown if click is outside
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsDropdownOpen(false);
      }
      // Close profile dropdown if click is outside
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Suggested searches data
  const suggestedSearches = [
    "Analytics dashboard",
    "Project timeline",
    "Budget overview",
    "Team members"
  ];

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleNotificationsClick = () => {
    setIsNotificationsDropdownOpen(!isNotificationsDropdownOpen);
  };

  const handleSearchClick = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      // Close other dropdowns when opening search
      setIsNotificationsDropdownOpen(false);
      setIsProfileDropdownOpen(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      isUnread: false
    })));
    // Close the notifications dropdown after marking all as read
    setIsNotificationsDropdownOpen(false);
  };

  // Calculate unreadCount from notifications
  const unreadCount = notifications.filter(notification => notification.isUnread).length;

  const handleSettingsClick = () => {
    navigate('/settings');
    setIsProfileDropdownOpen(false);
  };

  // Use AuthContext's user data for profile display
  const getProfileImage = () => {
    if (loading) return FALLBACK_PROFILE_IMAGE;
    
    if (user?.isGoogleUser) return user.photoURL;
    
    return user?.photoURL || (user?.uid ? getEmojiAvatar(user.uid) : FALLBACK_PROFILE_IMAGE);
  };

  const handleLogout = async () => {
    try {
      await signOut(); // Use AuthContext's signOut method
      navigate('/login');
      setIsProfileDropdownOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      {/* Left section - Logo */}
      <div className="flex-none transition-transform duration-300 hover:scale-105">
        <img 
          src={logo} 
          alt="Feedo AI Logo" 
          className="h-8 w-auto"
        />
      </div>
      
      {/* Right section - Actions */}
      <div className="flex items-center gap-6">
        <button className="upgrade-btn">
          <span className="btn-text">Upgrade Plan</span>
          <div className="shine-effect"></div>
        </button>
        
        {/* Search Section */}
        <div className="relative" ref={searchRef}>
          <button 
            onClick={handleSearchClick}
            className="text-gray-600 hover:text-gray-800 transition-all duration-300 hover:scale-110 p-2 rounded-full hover:bg-gray-100"
          >
            <FiSearch className="w-6 h-6" />
          </button>

          {/* Search Dropdown */}
          {isSearchOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="p-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>

                {/* Suggested Searches */}
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                    <FiTrendingUp className="w-4 h-4 mr-2" />
                    Suggested Searches
                  </h3>
                  <ul className="space-y-1">
                    {suggestedSearches.map((search, index) => (
                      <li key={index}>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                          {search}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 rounded-b-lg">
                Press <kbd className="px-2 py-1 bg-white rounded shadow">↵</kbd> to search
              </div>
            </div>
          )}
        </div>
        
        {/* Notifications Section */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={handleNotificationsClick}
            className="text-gray-600 hover:text-gray-800 transition-all duration-300 hover:scale-110 p-2 rounded-full hover:bg-gray-100 relative"
          >
            <FiBell className="w-6 h-6 cursor-pointer" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
              </div>
              <ul className="py-2 max-h-[300px] overflow-y-auto">
                {notifications.map((notification) => (
                  <li 
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                      notification.isUnread ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <notification.icon className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-800">{notification.content}</p>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Profile Section */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={handleProfileClick}
            className="flex items-center gap-3 focus:outline-none transition-all duration-300 hover:scale-105 p-1 rounded-lg hover:bg-gray-50"
          >
            {loading ? (
              <div className="header-profile-loading">
                <div className="skeleton header-skeleton-avatar"></div>
                <div className="skeleton header-skeleton-text"></div>
              </div>
            ) : (
              <>
                <div className="relative">
                  <div className="relative overflow-hidden rounded-full transition-transform duration-300 hover:scale-110">
                    <img
                      src={getProfileImage()}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover shadow-md"
                      onError={(e) => {
                        if (!user?.isGoogleUser) {
                          e.target.src = user?.uid ? getEmojiAvatar(user.uid) : FALLBACK_PROFILE_IMAGE;
                        }
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-md">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                  </div>
                </div>
                <span className="font-medium text-gray-800 transition-colors duration-300 hover:text-blue-600">
                  {user?.displayName || 'User'}
                </span>
              </>
            )}
          </button>

          {/* Profile Dropdown */}
          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <img
                    src={getProfileImage()}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      // Only fallback to emoji avatar for non-Google users
                      if (!user?.isGoogleUser) {
                        e.target.src = user?.uid ? getEmojiAvatar(user.uid) : FALLBACK_PROFILE_IMAGE;
                      }
                    }}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{user?.displayName}</h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>
              <ul className="py-2">
                <li>
                  <button 
                    onClick={handleSettingsClick}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <div className="p-2 rounded-full bg-gray-100 text-gray-500">
                      <FiSettings className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-gray-800">Settings</p>
                      <span className="text-xs text-gray-500">Manage your preferences</span>
                    </div>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <div className="p-2 rounded-full bg-gray-100 text-red-500">
                      <FiLogOut className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-red-600">Log Out</p>
                      <span className="text-xs text-gray-500">Sign out of your account</span>
                    </div>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;