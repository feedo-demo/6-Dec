/**
 * DashboardHeader Component with enhanced interactivity
 */

import React, { useState, useRef, useEffect } from 'react';
import { FiBell, FiSearch, FiMessageSquare, FiFileText, FiHeart, FiTrendingUp, FiSettings, FiLogOut, FiCheckCircle, FiAlertTriangle, FiAlertCircle, FiUser, FiBook, FiShield, FiSun, FiBriefcase, FiChevronRight } from 'react-icons/fi';
import logo from '../../assets/logo.png';
import './DashboardHeader.css';
import { FALLBACK_PROFILE_IMAGE, getEmojiAvatar } from '../../constants/profileData';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext';
import { applicationOperations, opportunityOperations } from '../../../applications/applicationManager';
import Button from '../Button/Button';

const DashboardHeader = () => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsDropdownOpen, setIsNotificationsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Refs for dropdown containers
  const searchRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  const navigate = useNavigate();
  
  // Use AuthContext instead of direct Firebase auth
  const { user, loading, signOut } = useAuth();

  // Add detailed debug logging
  console.log('Header User Data:', {
    fullUser: JSON.parse(JSON.stringify(user)),
    profile: JSON.parse(JSON.stringify(user?.profile)),
    firstName: user?.profile?.firstName,
    lastName: user?.profile?.lastName,
    provider: user?.profile?.provider,
    photoURL: user?.profile?.photoURL
  });

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

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Fetch applications and opportunities
      const [applications, opportunities] = await Promise.all([
        applicationOperations.getUserApplications(user.profile.authUid),
        opportunityOperations.getOpportunities({ userId: user.profile.authUid })
      ]);

      // Search through applications
      const applicationResults = applications
        .filter(app => 
          app.name?.toLowerCase().includes(query.toLowerCase()) ||
          app.category?.toLowerCase().includes(query.toLowerCase()) ||
          app.status?.toLowerCase().includes(query.toLowerCase())
        )
        .map(app => ({
          id: app.id,
          title: app.name,
          type: 'Application',
          status: app.status,
          icon: FiFileText,
          link: '/my-applications'
        }));

      // Search through opportunities
      const opportunityResults = opportunities
        .filter(opp => 
          opp.title?.toLowerCase().includes(query.toLowerCase()) ||
          opp.description?.toLowerCase().includes(query.toLowerCase())
        )
        .map(opp => ({
          id: opp.id,
          title: opp.title,
          type: 'Opportunity',
          status: opp.status,
          icon: FiBriefcase,
          link: '/new-opportunities'
        }));

      // Combine and sort results
      const combinedResults = [...applicationResults, ...opportunityResults]
        .sort((a, b) => a.title.localeCompare(b.title))
        .slice(0, 5); // Limit to 5 results

      setSearchResults(combinedResults);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      isUnread: false
    }));
    setNotifications(updatedNotifications);
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
    
    // For Google users
    if (user?.profile?.provider === 'google' && user?.profile?.photoURL) {
      return user.profile.photoURL;
    }
    
    // For users with custom uploaded photos
    if (user?.profile?.photoURL) {
      return user.profile.photoURL;
    }
    
    // Fallback to emoji avatar if we have authUid
    if (user?.profile?.authUid) {
      return getEmojiAvatar(user.profile.authUid);
    }
    
    return FALLBACK_PROFILE_IMAGE;
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

  // Add useEffect to fetch real notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.profile?.authUid) return;

      try {
        // Fetch both applications and opportunities
        const [applications, opportunities] = await Promise.all([
          applicationOperations.getUserApplications(user.profile.authUid),
          opportunityOperations.getOpportunities({ userId: user.profile.authUid })
        ]);

        // Format application notifications
        const applicationNotifications = applications.slice(0, 2).map(app => ({
          id: `app-${app.id}`,
          icon: getStatusIcon(app.status),
          content: getApplicationStatusMessage(app),
          time: formatTimeAgo(app.createdAt),
          isUnread: true,
          type: 'application'
        }));

        // Format opportunity notifications
        const opportunityNotifications = opportunities.slice(0, 1).map(opp => ({
          id: `opp-${opp.id}`,
          icon: FiSun,
          content: `New opportunity: ${opp.title}`,
          time: formatTimeAgo(opp.createdAt),
          isUnread: true,
          type: 'opportunity'
        }));

        // Get missing profile steps notification
        const missingStepNotification = getMissingStepNotification(user);

        // Combine all notifications
        const allNotifications = [
          ...applicationNotifications,
          ...opportunityNotifications,
          ...(missingStepNotification ? [missingStepNotification] : [])
        ].sort((a, b) => new Date(b.time) - new Date(a.time));

        setNotifications(allNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [user?.profile?.authUid]);

  // Helper function to get application status message
  const getApplicationStatusMessage = (application) => {
    switch (application.status) {
      case 'approved':
        return `Your application for ${application.name} was accepted`;
      case 'rejected':
        return `Your application for ${application.name} was rejected`;
      case 'pending':
        return `Your application for ${application.name} is under review`;
      case 'incomplete':
        return `Complete your application for ${application.name}`;
      case 'follow-up':
        return `Follow-up required for ${application.name}`;
      default:
        return `Applied to ${application.name}`;
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return FiCheckCircle;
      case 'rejected':
        return FiAlertTriangle;
      case 'pending':
        return FiFileText;
      case 'incomplete':
        return FiAlertTriangle;
      case 'follow-up':
        return FiAlertCircle;
      default:
        return FiFileText;
    }
  };

  // Helper function to get missing step notification with target tab
  const getMissingStepNotification = (user) => {
    if (!user?.profile?.professionalSummary) {
      return {
        id: 'missing-profile',
        icon: FiUser,
        content: 'Complete your professional summary',
        time: 'Now',
        isUnread: true,
        type: 'profile',
        targetTab: 'personal'
      };
    }
    if (!user?.education?.degreeLevel) {
      return {
        id: 'missing-education',
        icon: FiBook,
        content: 'Add your education details',
        time: 'Now',
        isUnread: true,
        type: 'profile',
        targetTab: 'education'
      };
    }
    if (!user?.verification?.isVerified) {
      return {
        id: 'missing-verification',
        icon: FiShield,
        content: 'Complete your verification',
        time: 'Now',
        isUnread: true,
        type: 'profile',
        targetTab: 'verification'
      };
    }
    return null;
  };

  // Helper function to format time ago
  const formatTimeAgo = (date) => {
    if (!date) return 'Now';
    
    // Convert Firestore Timestamp to Date if needed
    const past = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    
    if (isNaN(past.getTime())) {
      return 'Now';
    }

    const now = new Date();
    const diffTime = Math.abs(now - past);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} hours ago`;
    }
    if (diffDays === 1) {
      return 'Yesterday';
    }
    return `${diffDays} days ago`;
  };

  // Add this helper function to get notification color
  const getNotificationColor = (type) => {
    switch (type) {
      case 'application':
        return 'text-blue-500';
      case 'opportunity':
        return 'text-yellow-500';
      case 'profile':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  // Handle result click
  const handleResultClick = (result) => {
    navigate(result.link);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Update notification click handler to include tab navigation
  const handleNotificationClick = (notification) => {
    switch (notification.type) {
      case 'application':
        navigate('/my-applications');
        break;
      case 'opportunity':
        navigate('/new-opportunities');
        break;
      case 'profile':
        // Navigate to data management with specific tab
        navigate(`/data-management?tab=${notification.targetTab}`);
        break;
      default:
        break;
    }
    setIsNotificationsDropdownOpen(false);
  };

  // Add handler for upgrade plan button
  const handleUpgradePlan = () => {
    navigate('/subscription');
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
        <Button 
          variant="upgrade"
          onClick={handleUpgradePlan}
          className="w-auto px-10"
        >
          Upgrade Plan
        </Button>
        
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
                    placeholder="Search applications and opportunities..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>

                {/* Search Results */}
                <div className="mt-4">
                  {isSearching ? (
                    <div className="text-center py-4 text-gray-500">
                      Searching...
                    </div>
                  ) : searchQuery && searchResults.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No results found
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Search Results</h3>
                      <ul className="space-y-1">
                        {searchResults.map((result) => (
                          <li key={`${result.type}-${result.id}`}>
                            <button
                              onClick={() => handleResultClick(result)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-md flex items-center gap-2"
                            >
                              <result.icon className={`w-4 h-4 ${
                                result.type === 'Application' ? 'text-blue-500' : 'text-gray-500'
                              }`} />
                              <div>
                                <span className="font-medium">{result.title}</span>
                                <span className="text-xs text-gray-500 ml-2">
                                  {result.type}
                                </span>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
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
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <li 
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer 
                        transition-all duration-300 
                        ${notification.isUnread ? 'bg-blue-50/50' : ''}
                        hover:translate-x-1`}
                    >
                      <div className="flex items-start gap-3">
                        <notification.icon className={`w-5 h-5 ${getNotificationColor(notification.type)}`} />
                        <div>
                          <p className="text-sm text-gray-800">{notification.content}</p>
                          <span className="text-xs text-gray-500">{notification.time}</span>
                        </div>
                        <FiChevronRight className="w-4 h-4 text-gray-400 ml-auto transform 
                          transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-3 text-center text-gray-500">
                    No notifications
                  </li>
                )}
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
                      alt={`${user?.profile?.firstName || 'User'}'s profile`}
                      className="w-10 h-10 rounded-full object-cover shadow-md"
                      onError={(e) => {
                        // Only use emoji avatar for non-Google users
                        if (user?.profile?.provider !== 'google') {
                          e.target.src = user?.profile?.authUid ? 
                            getEmojiAvatar(user.profile.authUid) : 
                            FALLBACK_PROFILE_IMAGE;
                        } else {
                          // For Google users, use FALLBACK_PROFILE_IMAGE directly
                          e.target.src = FALLBACK_PROFILE_IMAGE;
                        }
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-md">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                  </div>
                </div>
                <span className="font-medium text-gray-800 transition-colors duration-300 hover:text-blue-600">
                  {user?.profile?.firstName && user?.profile?.lastName ? 
                    `${user.profile.firstName} ${user.profile.lastName}` : 
                    user?.metadata?.firstName && user?.metadata?.lastName ?
                    `${user.metadata.firstName} ${user.metadata.lastName}` :
                    'User'
                  }
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
                    alt={`${user?.profile?.firstName || 'User'}'s profile`}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      if (user?.profile?.provider !== 'google') {
                        e.target.src = user?.profile?.authUid ? 
                          getEmojiAvatar(user.profile.authUid) : 
                          FALLBACK_PROFILE_IMAGE;
                      } else {
                        e.target.src = FALLBACK_PROFILE_IMAGE;
                      }
                    }}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {user?.profile?.firstName ? 
                        `${user.profile.firstName} ${user.profile.lastName || ''}` : 
                        'User'
                      }
                    </h3>
                    <p className="text-sm text-gray-500">{user?.profile?.email}</p>
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