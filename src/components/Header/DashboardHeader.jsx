/**
 * DashboardHeader Component with enhanced interactivity
 */

import React, { useState, useRef, useEffect } from 'react';
import { FiBell, FiSearch, FiMessageSquare, FiFileText, FiHeart, FiTrendingUp, FiSettings, FiLogOut, FiCheckCircle, FiAlertTriangle, FiAlertCircle, FiUser, FiBook, FiShield, FiSun, FiBriefcase, FiChevronRight } from 'react-icons/fi';
import { logo } from '../../assets';
import './DashboardHeader.css';
import { FALLBACK_PROFILE_IMAGE, getEmojiAvatar } from '../../auth/profileData';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { applicationOperations, opportunityOperations } from '../../applications/applicationManager';
import Button from '../Button/Button';
import { db, auth } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import useProfileProgress from '../../hooks/useProfileProgress';
import NotificationBell from '../NotificationBell/NotificationBell';

const DashboardHeader = () => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { sections, getMissingSteps, isLoading: sectionsLoading } = useProfileProgress();

  // Refs for dropdown containers
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  const navigate = useNavigate();
  
  // Use AuthContext instead of direct Firebase auth
  const { user, loading: authLoading, signOut } = useAuth();

  // Add detailed debug logging
  console.log('Header User Data:', {
    fullUser: JSON.parse(JSON.stringify(user)),
    profile: JSON.parse(JSON.stringify(user?.profile)),
    firstName: user?.profile?.firstName,
    lastName: user?.profile?.lastName,
    provider: user?.profile?.provider,
    photoURL: user?.profile?.photoURL,
    authCurrentUser: auth.currentUser ? {
      photoURL: auth.currentUser.photoURL,
      providerData: auth.currentUser.providerData
    } : null
  });

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close search dropdown if click is outside
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
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

  const handleSearchClick = () => {
    setIsSearchOpen(!isSearchOpen);
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
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  // Calculate unreadCount from notifications
  const unreadCount = notifications.filter(notification => notification.isUnread).length;

  const handleSettingsClick = () => {
    navigate('/settings');
    setIsProfileDropdownOpen(false);
  };

  // Use AuthContext's user data for profile display
  const getProfileImage = () => {
    if (authLoading) return FALLBACK_PROFILE_IMAGE;
    
    console.log('User data in getProfileImage:', {
      provider: user?.profile?.provider,
      photoURL: user?.profile?.photoURL,
      authUid: user?.profile?.authUid,
      authUser: auth.currentUser,
      user: user
    });
    
    // For Google users, always use auth.currentUser.photoURL if available
    if (user?.profile?.provider === 'google.com' && auth.currentUser?.photoURL) {
      console.log('Returning Google auth photo URL:', auth.currentUser.photoURL);
      return auth.currentUser.photoURL;
    }
    
    // For users with profile photos (including Google users without current auth photo)
    if (user?.profile?.photoURL) {
      console.log('Returning profile photo URL:', user.profile.photoURL);
      return user.profile.photoURL;
    }
    
    // Try auth user's photo URL as fallback
    if (auth.currentUser?.photoURL) {
      console.log('Returning auth user photo URL:', auth.currentUser.photoURL);
      return auth.currentUser.photoURL;
    }
    
    // Fallback to emoji avatar if we have authUid
    if (user?.profile?.authUid) {
      const emojiAvatar = getEmojiAvatar(user.profile.authUid);
      console.log('Returning emoji avatar:', emojiAvatar);
      return emojiAvatar;
    }
    
    console.log('Returning fallback image');
    return FALLBACK_PROFILE_IMAGE;
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      setIsProfileDropdownOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Add checkSectionCompletion function
  const checkSectionCompletion = (sectionId, user, questions) => {
    // If no user data or no profile sections, section is incomplete
    if (!user?.profileSections || !user.profileSections[sectionId]) {
      console.log(`Section ${sectionId} incomplete: No user data or section data`);
      return false;
    }

    const sectionData = user.profileSections[sectionId];
    
    // If no questions array in section data, section is incomplete
    if (!sectionData.questions || !Array.isArray(sectionData.questions)) {
      console.log(`Section ${sectionId} incomplete: No questions array in section data`);
      return false;
    }

    // If no questions in config, section is incomplete
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      console.log(`Section ${sectionId} incomplete: No questions in config`);
      return false;
    }

    // Get required questions from config
    const requiredQuestions = questions.filter(q => q.required);
    
    // For sections with no required questions, treat all questions as required
    const questionsToCheck = requiredQuestions.length > 0 ? requiredQuestions : questions;
    
    // Check each question
    for (const question of questionsToCheck) {
      const questionData = sectionData.questions.find(q => q.id === question.id);
      
      // If question data doesn't exist or has no answer, section is incomplete
      if (!questionData || !questionData.answer) {
        console.log(`Section ${sectionId} incomplete: Missing answer for question ${question.id}`);
        return false;
      }

      // For repeater type questions
      if (question.type === 'repeater' && question.repeaterFields) {
        // If answer is not an array or is empty, section is incomplete
        if (!Array.isArray(questionData.answer) || questionData.answer.length === 0) {
          console.log(`Section ${sectionId} incomplete: Empty or invalid repeater answer for question ${question.id}`);
          return false;
        }

        // Check each repeater entry for fields
        const fieldsToCheck = question.repeaterFields.filter(field => field.required || requiredQuestions.length === 0);
        for (const entry of questionData.answer) {
          for (const field of fieldsToCheck) {
            if (!entry || !entry[field.id] || entry[field.id] === '') {
              console.log(`Section ${sectionId} incomplete: Missing field ${field.id} in question ${question.id}`);
              return false;
            }
          }
        }
      }
      // For non-repeater questions
      else {
        // Check for empty string, null, undefined, or empty array
        const isEmpty = 
          questionData.answer === '' || 
          questionData.answer === null || 
          questionData.answer === undefined ||
          (Array.isArray(questionData.answer) && (
            questionData.answer.length === 0 || 
            questionData.answer.every(a => a === null || a === undefined || a === '')
          ));

        if (isEmpty) {
          console.log(`Section ${sectionId} incomplete: Empty answer for question ${question.id}`);
          return false;
        }
      }
    }

    // If we get here, all checked questions have valid answers
    console.log(`Section ${sectionId} complete: All questions answered`);
    return true;
  };

  // Update the useEffect that fetches notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.profile?.authUid || sectionsLoading || authLoading) return;

      try {
        console.log('Fetching notifications with user:', user);
        console.log('Sections:', sections);

        // Get missing steps
        const missingStepsData = getMissingSteps();
        console.log('Missing steps data:', missingStepsData);
        
        let missingStepNotification = null;
        
        if (missingStepsData?.sections?.length > 0 && missingStepsData.message) {
          missingStepNotification = {
            id: missingStepsData.sections.length > 1 ? 'missing-multiple' : `missing-${missingStepsData.sections[0].id}`,
            type: missingStepsData.sections.length > 1 ? 'Missing Steps' : 'Missing Step',
            icon: missingStepsData.sections.length > 1 ? FiAlertCircle : getSectionIcon(missingStepsData.sections[0].id),
            content: missingStepsData.message,
            time: 'Now',
            isUnread: true,
            link: `/data-management?tab=${missingStepsData.sections[0].id}`
          };
        }

        // Get saved read states
        const savedNotifications = localStorage.getItem('notifications');
        let readStates = {};
        if (savedNotifications) {
          try {
            const parsed = JSON.parse(savedNotifications);
            readStates = parsed.reduce((acc, n) => ({
              ...acc,
              [n.id]: !n.isUnread
            }), {});
          } catch (error) {
            console.error('Error parsing saved notifications:', error);
          }
        }

        // Fetch other notifications (applications, opportunities, etc.)
        const [applications, opportunities] = await Promise.all([
          applicationOperations.getUserApplications(user.profile.authUid),
          opportunityOperations.getOpportunities({ userId: user.profile.authUid })
        ]);

        // Format application notifications
        const applicationNotifications = applications.slice(0, 2).map(app => ({
          id: `app-${app.id}`,
          type: 'Application',
          icon: getStatusIcon(app.status),
          content: getApplicationStatusMessage(app),
          time: formatTimeAgo(app.createdAt),
          isUnread: !readStates[`app-${app.id}`],
          link: '/my-applications'
        }));

        // Format opportunity notifications
        const opportunityNotifications = opportunities.slice(0, 2).map(opp => ({
          id: `opp-${opp.id}`,
          type: 'New Opportunity',
          icon: FiSun,
          content: `New opportunity: ${opp.title}`,
          time: formatTimeAgo(opp.createdAt),
          isUnread: !readStates[`opp-${opp.id}`],
          link: '/new-opportunities'
        }));

        // Combine all notifications and preserve read states
        const allNotifications = [
          ...(missingStepNotification ? [{
            ...missingStepNotification,
            isUnread: !readStates[missingStepNotification.id]
          }] : []),
          ...applicationNotifications,
          ...opportunityNotifications
        ].sort((a, b) => new Date(b.time) - new Date(a.time));

        console.log('Setting notifications:', allNotifications);

        // Store notifications in localStorage
        localStorage.setItem('notifications', JSON.stringify(allNotifications));
        setNotifications(allNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [user?.profile?.authUid, user?.profileSections, sections, sectionsLoading, authLoading]);

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

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      case 'pending':
        return 'text-blue-500';
      case 'incomplete':
        return 'text-orange-500';
      case 'follow-up':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  // Helper function to get status background color
  const getStatusBgColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50';
      case 'rejected':
        return 'bg-red-50';
      case 'pending':
        return 'bg-blue-50';
      case 'incomplete':
        return 'bg-orange-50';
      case 'follow-up':
        return 'bg-yellow-50';
      default:
        return 'bg-gray-50';
    }
  };

  // Helper function to get notification color
  const getNotificationColor = (type) => {
    switch (type) {
      case 'Missing Steps':
      case 'Missing Step':
        return 'text-orange-500';
      case 'Application':
        return 'text-blue-500';
      case 'New Opportunity':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  // Helper function to get notification background color
  const getNotificationBgColor = (type) => {
    switch (type) {
      case 'Missing Steps':
      case 'Missing Step':
        return 'bg-orange-50';
      case 'Application':
        return 'bg-blue-50';
      case 'New Opportunity':
        return 'bg-yellow-50';
      default:
        return 'bg-gray-50';
    }
  };

  // Add this helper function to get section icon
  const getSectionIcon = (sectionId) => {
    switch (sectionId) {
      case 'personal':
        return FiUser;
      case 'education':
        return FiBook;
      case 'workExperience':
        return FiBriefcase;
      case 'verification':
        return FiShield;
      default:
        return FiFileText;
    }
  };

  // Update the getMissingStepNotification function
  const getMissingStepNotification = (user) => {
    console.log('GetMissingStepNotification - User Data:', {
      hasUser: !!user,
      hasProfile: !!user?.profile,
      userType: user?.profile?.userType,
      provider: user?.profile?.provider,
      profileData: user?.profileData,
      sectionsLength: sections.length,
      sections: sections
    });

    // Check if we have sections and user type
    if (!sections.length || !user?.profile?.userType) {
      console.log('No sections or user type available');
      return null;
    }

    // For new users (no profileData) or empty profileData, show missing steps
    if (!user?.profileData || Object.keys(user?.profileData || {}).length === 0) {
      console.log('New user or empty profile data - showing missing steps');
      return {
        id: 'missing-multiple',
        icon: FiAlertCircle,
        content: 'Complete all required sections in your profile',
        time: 'Now',
        isUnread: true,
        type: 'profile',
        targetTab: sections[0].id
      };
    }

    // Get incomplete sections
    const incompleteSections = [];
    
    sections.forEach(section => {
      const sectionData = user.profileData?.[section.id];
      const isComplete = sectionData && Object.keys(sectionData).length > 0 && 
                        checkSectionCompletion(section.id, sectionData, section);
      
      console.log(`Section ${section.id} completion:`, {
        isComplete,
        sectionData,
        section
      });
      
      if (!isComplete) {
        incompleteSections.push({
          id: section.id,
          label: section.label
        });
      }
    });

    console.log('Incomplete sections:', incompleteSections);

    // If multiple sections are incomplete
    if (incompleteSections.length > 1) {
      return {
        id: 'missing-multiple',
        icon: FiAlertCircle,
        content: 'Complete all required sections in your profile',
        time: 'Now',
        isUnread: true,
        type: 'profile',
        targetTab: incompleteSections[0].id
      };
    }

    // If only one section is incomplete
    if (incompleteSections.length === 1) {
      const section = incompleteSections[0];
      return {
        id: `missing-${section.id}`,
        icon: getSectionIcon(section.id),
        content: `Complete your ${section.label.toLowerCase()}`,
        time: 'Now',
        isUnread: true,
        type: 'profile',
        targetTab: section.id
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

  // Handle result click
  const handleResultClick = (result) => {
    navigate(result.link);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Update notification click handler to include tab navigation
  const handleNotificationClick = (notification) => {
    // Mark the clicked notification as read
    const updatedNotifications = notifications.map(n => ({
      ...n,
      isUnread: n.id === notification.id ? false : n.isUnread
    }));
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));

    // Navigate based on notification type
    switch (notification.type) {
      case 'Missing Steps':
      case 'Missing Step':
        navigate(notification.link);
        break;
      case 'Application':
        navigate('/my-applications');
        break;
      case 'New Opportunity':
        navigate('/new-opportunities');
        break;
      default:
        break;
    }
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
        <NotificationBell 
          notifications={notifications} 
          setNotifications={setNotifications} 
        />
        
        {/* Profile Section */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={handleProfileClick}
            className="flex items-center gap-3 focus:outline-none transition-all duration-300 hover:scale-105 p-1 rounded-lg hover:bg-gray-50"
          >
            {authLoading ? (
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
                      onError={async (e) => {
                        // For Google users, try to refresh the photo URL
                        if (user?.profile?.provider === 'google') {
                          try {
                            await refreshUser();
                            // If refresh successful, retry with the new URL
                            e.target.src = getProfileImage();
                            return;
                          } catch (error) {
                            console.error('Error refreshing Google profile photo:', error);
                          }
                        }
                        
                        // Fallback for non-Google users or if refresh fails
                        e.target.src = user?.profile?.authUid ? 
                          getEmojiAvatar(user.profile.authUid) : 
                          FALLBACK_PROFILE_IMAGE;
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