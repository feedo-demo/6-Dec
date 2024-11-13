/**
 * MyApplications Component
 * 
 * A comprehensive dashboard for managing job applications with advanced features and animations.
 * 
 * Key Features:
 * 1. Status Overview
 *    - Visual summary boxes showing counts for different application statuses
 *    - Interactive boxes that serve as filters
 *    - Animated counters and visual effects
 * 
 * 2. Search & Filtering
 *    - Real-time search across application names, categories, and statuses
 *    - Status-based filtering with visual feedback
 *    - Combined search and filter functionality
 * 
 * 3. Application Management
 *    - Tabulated view of all applications
 *    - Sortable columns
 *    - Status badges with distinct colors
 *    - Deadline tracking with visual indicators
 * 
 * 4. Actions & Interactions
 *    - View application details
 *    - Edit application information
 *    - Delete applications
 *    - Create new applications
 * 
 * 5. Pagination
 *    - Configurable items per page
 *    - Previous/Next navigation
 *    - Page tracking
 * 
 * 6. Responsive Design
 *    - Adapts to different screen sizes
 *    - Mobile-friendly interface
 *    - Flexible layout components
 * 
 * Technical Implementation:
 * - Uses React hooks for state management
 * - Implements custom animations and transitions
 * - Utilizes React Icons for consistent iconography
 * - Features optimized filtering and search algorithms
 * 
 * @component
 * @example
 * return (
 *   <MyApplications />
 * )
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/AuthContext';
import { applicationOperations } from '../../../applications/applicationManager';
import {
    FiSearch,      // Search/magnifying glass icon - Used for search functionality
    FiFilter,      // Filter icon - Used for filtering applications
    FiEye,         // Eye icon - Used for viewing application details
    FiEdit2,       // Pencil icon - Used for editing applications
    FiTrash2,      // Trash bin icon - Used for deleting applications
    FiClock,       // Clock icon - Used for pending/time-related status
    FiFileText,    // Document icon - Used for application/form representation
    FiAlertCircle, // Alert circle icon - Used for warnings or important notices
    FiRefreshCw,   // Refresh icon - Used for refreshing data/status
    FiCheckCircle, // Check circle icon - Used for approved/success status
    FiXCircle,     // X circle icon - Used for rejected/error status
    FiPlus,        // Plus icon - Used for adding new applications
    FiChevronRight // Right arrow icon - Used for navigation/expand actions
} from 'react-icons/fi';
import './MyApplications.css';
import AnimatedNumber from '../../components/Animated/AnimatedNumber';
import Button from '../../components/Button/Button';

/**
 * Formats a date string into a more readable format
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string (e.g., "Mar 15, 2024")
 */
const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch applications and stats
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.profile?.authUid) return;

      try {
        setLoading(true);
        const [applicationsData, statsData] = await Promise.all([
          applicationOperations.getUserApplications(user.profile.authUid, {
            status: filterStatus !== 'all' ? filterStatus : undefined
          }),
          applicationOperations.getApplicationStats(user.profile.authUid)
        ]);

        setApplications(applicationsData);
        setStats(statsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load applications. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.profile?.authUid, filterStatus]);

  /**
   * Creates a demo application for testing purposes
   * TODO: Remove this in production - This is only for demonstration
   */
  const createDemoApplication = () => {
    // Generate random company name from top tech companies
    const companies = ['Google', 'Meta', 'Apple', 'Amazon', 'Microsoft', 'Netflix', 'Tesla', 'Twitter'];
    const positions = ['Frontend Developer', 'Backend Engineer', 'Full Stack Developer', 'UI/UX Designer', 'Product Manager'];
    const categories = ['Technology', 'Development', 'Design', 'Product', 'Engineering'];
    const statuses = ['pending', 'approved', 'rejected', 'follow-up', 'incomplete'];
    
    const randomCompany = companies[Math.floor(Math.random() * companies.length)];
    const randomPosition = positions[Math.floor(Math.random() * positions.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    // Create demo application data
    const demoApplication = {
      name: `${randomPosition} - ${randomCompany}`,
      category: randomCategory,
      description: `Exciting opportunity to work as a ${randomPosition} at ${randomCompany}.`,
      status: randomStatus,
      progress: Math.floor(Math.random() * 100), // Random progress 0-100
      userId: user.profile.authUid,
      submissionDate: new Date().toISOString(),
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      documents: [],
      interviews: [],
      notes: '',
      feedback: '',
      isArchived: false
    };

    return demoApplication;
  };

  /**
   * Handles the creation of a new application
   * TODO: In production, this should open a form modal instead of creating demo data
   */
  const handleCreateApplication = async () => {
    try {
      setLoading(true);
      const demoApplication = createDemoApplication();
      
      // Create new application using applicationOperations
      const newApplication = await applicationOperations.createApplication(demoApplication);

      // Update local state
      setApplications(prev => [newApplication, ...prev]);
      
      // Update stats - Add null check and initialize if needed
      setStats(prev => {
        const currentStats = prev || {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          incomplete: 0,
          followUp: 0
        };
        
        // Convert follow-up status to match stats key
        const statusKey = newApplication.status === 'follow-up' ? 'followUp' : newApplication.status;
        
        return {
          ...currentStats,
          total: currentStats.total + 1,
          [statusKey]: currentStats[statusKey] + 1
        };
      });

      // Show success message (you might want to add a toast notification here)
      console.log('Demo application created successfully!');
    } catch (err) {
      console.error('Error creating demo application:', err);
      setError('Failed to create application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle application deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        setLoading(true);
        await applicationOperations.deleteApplication(id);
        
        // Update local state
        const deletedApp = applications.find(app => app.id === id);
        setApplications(prev => prev.filter(app => app.id !== id));
        
        // Update stats
        if (deletedApp) {
          setStats(prev => ({
            ...prev,
            total: prev.total - 1,
            [deletedApp.status]: prev[deletedApp.status] - 1
          }));
        }
      } catch (err) {
        console.error('Error deleting application:', err);
        setError('Failed to delete application. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  /**
   * Status summary object
   * Tracks the count of applications in each status category
   * Used for displaying status boxes and quick statistics
   */
  const statusSummary = stats || {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    incomplete: 0,
    followUp: 0
  };

  /**
   * Handles search input changes
   * - Updates search term state
   * - Resets pagination to first page
   * @param {Event} event - Input change event
   */
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  /**
   * Filters applications based on current search term and status filter
   * Implements case-insensitive search across multiple fields
   * @returns {Array} Filtered applications array
   */
  const getFilteredApplications = () => {
    return applications.filter(app => {
      // Status filter
      const statusMatch = filterStatus === 'all' || 
                         (filterStatus === 'follow-up' && app.status === 'follow-up') ||
                         (filterStatus === 'incomplete' && app.status === 'incomplete') ||
                         app.status === filterStatus;
      
      // Search filter - case insensitive search across multiple fields
      const searchLower = searchTerm.toLowerCase();
      const searchMatch = searchTerm === '' || 
        app.name.toLowerCase().includes(searchLower) ||
        app.category.toLowerCase().includes(searchLower) ||
        app.status.toLowerCase().includes(searchLower);
      
      // Return true only if both status and search filters match
      return statusMatch && searchMatch;
    });
  };

  /**
   * Action handler for viewing application details
   * Opens a modal or navigates to detail view
   * @param {number} id - Application ID to view
   */
  const handleView = (id) => {
    console.log('Viewing application:', id);
  };

  /**
   * Action handler for editing application
   * Opens edit form modal or navigates to edit page
   * @param {number} id - Application ID to edit
   */
  const handleEdit = (id) => {
    console.log('Editing application:', id);
  };

  /**
   * Pagination helper functions
   * Calculate current page items and total pages
   */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = getFilteredApplications().slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(getFilteredApplications().length / itemsPerPage);

  /**
   * Pagination event handlers
   * Handle page navigation and boundary conditions
   */
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  /**
   * Handles status filter changes
   * - Updates filter status state
   * - Resets pagination to first page
   * - Updates dropdown select value
   * @param {string} status - The new status filter value
   */
  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  return (
    <div className="my-applications">
      {/* Header Section - Contains create button and page title */}
      <div className="applications-header">
        <Button 
          variant="create"
          onClick={handleCreateApplication}
          disabled={loading}
          className="w-auto px-10 inline-flex items-center"
        >
          <FiPlus className="w-4 h-4 mr-2 inline-block" />
          <span>Create Demo Application</span>
        </Button>
      </div>

      {/* Status Summary Section - Interactive status filter boxes */}
      <div className="status-boxes">
        {/* Total Applications Box */}
        <div 
          className={`status-box total ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('all')}
          role="button"
          tabIndex={0}
          aria-label="Filter by all applications"
        >
          <div className="status-icon">
            <FiFileText size={24} />
          </div>
          <div className="status-content">
            <div className="status-label">Total</div>
            <div className="status-value">
              <AnimatedNumber value={statusSummary.total} />
            </div>
          </div>
        </div>

        <div 
          className={`status-box pending ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('pending')}
          role="button"
          tabIndex={0}
          aria-label="Filter by pending applications"
        >
          <div className="status-icon">
            <FiClock size={24} />
          </div>
          <div className="status-content">
            <div className="status-label">Pending</div>
            <div className="status-value">
              <AnimatedNumber value={statusSummary.pending} />
            </div>
          </div>
        </div>

        <div 
          className={`status-box incomplete ${filterStatus === 'incomplete' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('incomplete')}
          role="button"
          tabIndex={0}
          aria-label="Filter by incomplete applications"
        >
          <div className="status-icon">
            <FiAlertCircle size={24} />
          </div>
          <div className="status-content">
            <div className="status-label">Incomplete</div>
            <div className="status-value">
              <AnimatedNumber value={statusSummary.incomplete} />
            </div>
          </div>
        </div>

        <div 
          className={`status-box follow-up ${filterStatus === 'follow-up' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('follow-up')}
          role="button"
          tabIndex={0}
          aria-label="Filter by follow-up applications"
        >
          <div className="status-icon">
            <FiRefreshCw size={24} />
          </div>
          <div className="status-content">
            <div className="status-label">Follow-Up</div>
            <div className="status-value">
              <AnimatedNumber value={statusSummary.followUp} />
            </div>
          </div>
        </div>

        <div 
          className={`status-box approved ${filterStatus === 'approved' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('approved')}
          role="button"
          tabIndex={0}
          aria-label="Filter by approved applications"
        >
          <div className="status-icon">
            <FiCheckCircle size={24} />
          </div>
          <div className="status-content">
            <div className="status-label">Approved</div>
            <div className="status-value">
              <AnimatedNumber value={statusSummary.approved} />
            </div>
          </div>
        </div>

        <div 
          className={`status-box rejected ${filterStatus === 'rejected' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('rejected')}
          role="button"
          tabIndex={0}
          aria-label="Filter by rejected applications"
        >
          <div className="status-icon">
            <FiXCircle size={24} />
          </div>
          <div className="status-content">
            <div className="status-label">Rejected</div>
            <div className="status-value">
              <AnimatedNumber value={statusSummary.rejected} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="search-filter-section">
        <div className="flex items-center gap-4 justify-end">
          {/* Search Input */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search job applications..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
              aria-label="Search applications"
            />
          </div>
          
          {/* Status Filter Dropdown */}
          <select 
            value={filterStatus}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="status-filter"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table Section */}
      <div className="applications-table">
        <table>
          {/* Table Header - Removed Deadline */}
          <thead>
            <tr>
              <th>Job Application Name</th>
              <th>Submission Date</th>
              <th>Status</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          
          {/* Table Body - Updated */}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5">
                  <div className="loading-state p-8 text-center text-gray-500">
                    Loading applications...
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5">
                  <div className="error-state p-8 text-center text-gray-500">
                    {error}
                  </div>
                </td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan="5">
                  <div className="empty-state p-4 text-center text-gray-500">
                    {searchTerm || filterStatus !== 'all' ? 
                      'No applications found matching your search.' : 
                      'No applications yet.'}
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((app) => (
                <tr key={app.id}>
                  {/* Application Name */}
                  <td>{app.name}</td>
                  
                  {/* Submission Date */}
                  <td>{formatDate(app.submissionDate)}</td>
                  
                  {/* Status Badge */}
                  <td>
                    <span className={`status-badge ${app.status}`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </td>
                  
                  {/* Category */}
                  <td>{app.category}</td>
                  
                  {/* Action Buttons */}
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleView(app.id)}
                        className="action-btn view"
                        title="View Details"
                        aria-label={`View details for ${app.name}`}
                      >
                        <FiEye />
                      </button>
                      <button 
                        onClick={() => handleEdit(app.id)}
                        className="action-btn edit"
                        title="Edit Application"
                        aria-label={`Edit ${app.name}`}
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        onClick={() => handleDelete(app.id)}
                        className="action-btn delete"
                        title="Delete Application"
                        aria-label={`Delete ${app.name}`}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="pagination">
        <button 
          className="pagination-btn"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          Previous
        </button>
        <button 
          className="pagination-btn"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MyApplications;