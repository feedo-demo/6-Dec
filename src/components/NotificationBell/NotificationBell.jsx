import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiChevronRight } from 'react-icons/fi';

const NotificationBell = ({ notifications, setNotifications }) => {
  const [isNotificationsDropdownOpen, setIsNotificationsDropdownOpen] = useState(false);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationsClick = () => {
    setIsNotificationsDropdownOpen(!isNotificationsDropdownOpen);
  };

  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      isUnread: false
    }));
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    setIsNotificationsDropdownOpen(false);
  };

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
    setIsNotificationsDropdownOpen(false);
  };

  // Helper function to get notification color
  const getNotificationColor = (type) => {
    switch (type) {
      case 'Missing Steps':
      case 'Missing Step':
        return 'text-orange-600';
      case 'Application':
        return 'text-blue-600';
      case 'New Opportunity':
        return 'text-yellow-600';
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

  const unreadCount = notifications.filter(notification => notification.isUnread).length;

  return (
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
                    <div className={`flex-shrink-0 p-2 rounded-full ${getNotificationBgColor(notification.type)}`}>
                      <notification.icon className={`w-5 h-5 ${getNotificationColor(notification.type)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">
                        {notification.type === 'Missing Steps' || notification.type === 'Missing Step' ? (
                          <span className="font-normal">{notification.content}</span>
                        ) : notification.type === 'Application' ? (
                          <span className="font-normal">{notification.content}</span>
                        ) : (
                          <span className="font-normal">{notification.content}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">{notification.time}</p>
                    </div>
                    <div className="flex-shrink-0 self-center ml-2">
                      <FiChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-center text-gray-600">
                No notifications
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 