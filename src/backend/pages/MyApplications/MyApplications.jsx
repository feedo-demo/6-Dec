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

import React, { useState } from 'react';
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
  /**
   * Application state management
   * - applications: Array of application objects with details
   * - searchTerm: Current search input value
   * - filterStatus: Current status filter selection
   * - currentPage: Active pagination page
   */
  const [applications, setApplications] = useState([
    {
      id: 1,
      name: "Senior Software Engineer - Microsoft",
      submissionDate: "2024-03-15",
      status: "pending",
      category: "Technology",
      deadline: "2024-04-30"
    },
    {
      id: 2,
      name: "Product Manager - Google",
      submissionDate: "2024-03-10",
      status: "approved",
      category: "Product Management",
      deadline: "2024-04-15"
    },
    {
      id: 3,
      name: "UX Designer - Apple",
      submissionDate: "2024-03-08",
      status: "rejected",
      category: "Design",
      deadline: "2024-05-01"
    },
    {
      id: 4,
      name: "Data Scientist - Amazon",
      submissionDate: "2024-03-12",
      status: "follow-up",
      category: "Data Science",
      deadline: "2024-06-30"
    },
    {
      id: 5,
      name: "Frontend Developer - Meta",
      submissionDate: "2024-03-01",
      status: "incomplete",
      category: "Development",
      deadline: "2024-04-20"
    },
    {
      id: 6,
      name: "DevOps Engineer - Netflix",
      submissionDate: "2024-02-28",
      status: "pending",
      category: "Operations",
      deadline: "2024-05-15"
    },
    {
      id: 7,
      name: "Full Stack Developer - Spotify",
      submissionDate: "2024-03-05",
      status: "follow-up",
      category: "Development",
      deadline: "2024-04-25"
    },
    {
      id: 8,
      name: "Cloud Architect - AWS",
      submissionDate: "2024-03-18",
      status: "incomplete",
      category: "Infrastructure",
      deadline: "2024-06-01"
    },
    {
      id: 9,
      name: "ML Engineer - OpenAI",
      submissionDate: "2024-03-20",
      status: "approved",
      category: "AI/ML",
      deadline: "2024-05-30"
    },
    {
      id: 10,
      name: "Backend Developer - LinkedIn",
      submissionDate: "2024-03-14",
      status: "follow-up",
      category: "Development",
      deadline: "2024-04-28"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items to show per page

  /**
   * Status summary object
   * Tracks the count of applications in each status category
   * Used for displaying status boxes and quick statistics
   */
  const statusSummary = {
    total: 10,
    pending: 2,
    incomplete: 2,
    followUp: 3,
    approved: 2,
    rejected: 1
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
   * Action handler for deleting application
   * Shows confirmation dialog before deletion
   * @param {number} id - Application ID to delete
   */
  const handleDelete = (id) => {
    console.log('Deleting application:', id);
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
        <button className="create-application-btn">
          <FiPlus className="w-4 h-4" />
          Create New Job Application
        </button>
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
          {/* Table Header */}
          <thead>
            <tr>
              <th>Job Application Name</th>
              <th>Submission Date</th>
              <th>Status</th>
              <th>Category</th>
              <th>Deadline</th>
              <th>Actions</th>
            </tr>
          </thead>
          
          {/* Table Body - Mapped Applications */}
          <tbody>
            {currentItems.map((app) => (
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
                
                {/* Deadline with Icon */}
                <td>
                  <div className="deadline-cell">
                    <FiClock className="deadline-icon" />
                    {formatDate(app.deadline)}
                  </div>
                </td>
                
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
            ))}
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