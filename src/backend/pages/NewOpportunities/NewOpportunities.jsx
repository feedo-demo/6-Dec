/**
 * NewOpportunities Page Component
 * 
 * This component displays a comprehensive list of funding opportunities and grants.
 * Key features include:
 * - Searchable opportunities list with pagination
 * - Match percentage visualization for each opportunity
 * - Application progress tracking
 * - Interactive "Apply Now" functionality with slide panel
 * - Responsive design for various screen sizes
 * 
 * Component Structure:
 * - StatCards (top metrics)
 * - Search functionality
 * - Opportunities table with progress bars
 * - Pagination controls
 * - Slide panel for opportunity details
 */

import React, { useState, useEffect } from 'react';
// Icon component for visual indicators
import { FiChevronDown, FiPlus } from 'react-icons/fi';
// Custom components for page sections
import StatCards from './sections/StatCards/StatCards';
import './NewOpportunities.css';
// Animated number component for dynamic values
import AnimatedNumber from '../../../components/Animated/AnimatedNumber';
// Navigation hook for routing
import { useNavigate } from 'react-router-dom';
// Panel components for detailed views
import SlidePanel from './sections/SlidePanel/SlidePanel';
import OpportunityDetails from './sections/OpportunityDetails/OpportunityDetails';
// Add imports
import { useAuth } from '../../../auth/AuthContext';
import { opportunityOperations, createOpportunityDataStructure } from '../../../applications/applicationManager';
// First, add Button to imports at the top
import Button from '../../../components/Button/Button';

// Add this helper function near the top of the file
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // If deadline is today
  if (diffDays === 0) {
    return 'Today';
  }
  
  // If deadline is tomorrow
  if (diffDays === 1) {
    return 'Tomorrow';
  }
  
  // If deadline is within next 7 days
  if (diffDays > 0 && diffDays <= 7) {
    return `${diffDays} days left`;
  }

  // For other dates, show formatted date
  const options = { 
    month: 'short', 
    day: 'numeric', 
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
  };
  
  return date.toLocaleDateString('en-US', options);
};

const NewOpportunities = () => {
  // State for search functionality
  const [searchTerm, setSearchTerm] = useState('');
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Changed from 5 to 10 items per page
  const navigate = useNavigate();
  // State for selected opportunity details
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  // Add state and auth
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0);

  // Add createDemoOpportunity function
  const createDemoOpportunity = () => {
    const companies = ['Google', 'Meta', 'Apple', 'Amazon', 'Microsoft', 'Netflix', 'Tesla', 'Twitter'];
    const positions = ['Frontend Developer', 'Backend Engineer', 'Full Stack Developer', 'UI/UX Designer', 'Product Manager'];
    const categories = ['Technology', 'Development', 'Design', 'Product', 'Engineering'];
    const statuses = ['new', 'active', 'closing-soon'];
    const locations = ['remote', 'onsite', 'hybrid'];
    
    const randomCompany = companies[Math.floor(Math.random() * companies.length)];
    const randomPosition = positions[Math.floor(Math.random() * positions.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];

    return {
      title: `${randomPosition} at ${randomCompany}`,
      type: 'job',
      creatorId: user.profile.authUid,
      description: `Exciting opportunity to work as a ${randomPosition} at ${randomCompany}.`,
      category: randomCategory,
      status: randomStatus,
      location: {
        type: randomLocation,
        country: 'United Kingdom',
        city: 'London'
      },
      requirements: [
        'Bachelor\'s degree in Computer Science or related field',
        '3+ years of professional experience',
        'Strong problem-solving skills',
        'Excellent communication skills'
      ],
      compensation: {
        type: 'paid',
        amount: Math.floor(Math.random() * (150000 - 50000) + 50000),
        currency: 'GBP',
        details: 'Annual salary + benefits'
      },
      visibility: 'public'
    };
  };

  // Add useEffect to fetch opportunities when component mounts
  useEffect(() => {
    const fetchOpportunities = async () => {
      if (!user?.profile?.authUid) return;

      try {
        setLoading(true);
        const [fetchedOpportunities, statsData] = await Promise.all([
          opportunityOperations.getOpportunities({
            userId: user.profile.authUid
          }),
          opportunityOperations.getOpportunityStats(user.profile.authUid)
        ]);

        // Log the fetched data for debugging
        console.log('Fetched opportunities:', fetchedOpportunities);
        
        // Update state with fetched data
        setOpportunities(fetchedOpportunities || []);
        setStats(statsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
        setError('Failed to load opportunities. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // Call fetchOpportunities when component mounts or user changes
    fetchOpportunities();
  }, [user?.profile?.authUid]); // Add user ID to dependencies

  // Update handleCreateDemoOpportunity to use the user's ID
  const handleCreateDemoOpportunity = async () => {
    if (!user?.profile?.authUid) return;

    try {
      setLoading(true);
      const demoOpportunity = createDemoOpportunity();
      const opportunityData = createOpportunityDataStructure({
        ...demoOpportunity,
        creatorId: user.profile.authUid
      });
      
      // Create new opportunity using opportunityOperations
      const newOpportunity = await opportunityOperations.createOpportunity(opportunityData);

      // Update local state
      setOpportunities(prev => [newOpportunity, ...prev]);
      
      // Trigger stats refresh
      setStatsRefreshTrigger(prev => prev + 1);

      console.log('Demo opportunity created successfully!');
    } catch (err) {
      console.error('Error creating demo opportunity:', err);
      setError('Failed to create opportunity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter opportunities based on search term
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = !searchTerm || 
      (opp.title && opp.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (opp.description && opp.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredOpportunities.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOpportunities.slice(indexOfFirstItem, indexOfLastItem);

  // Navigation handlers for pagination
  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Handler for opportunity selection
  const handleApplyClick = (opportunity) => {
    setSelectedOpportunity(opportunity);
  };

  return (
    <div className="new-opportunities-page">
      <div className="flex justify-end items-center mb-8">
        <Button 
          variant="create"
          onClick={handleCreateDemoOpportunity}
          disabled={loading}
          className="w-auto px-10 inline-flex items-center"
        >
          <FiPlus className="w-4 h-4 mr-2 inline-block" />
          <span>Create Demo Opportunity</span>
        </Button>
      </div>
      {/* Top statistics cards */}
      <StatCards refreshTrigger={statsRefreshTrigger} />
      
      {/* Main opportunities list section */}
      <div className="opportunities-section">
        <div className="section-header">
          <h2 className="section-title">List of Opportunities</h2>
          
          {/* Search input container */}
          <div className="search-container">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>

        {/* Opportunities data table */}
        <div className="opportunities-table">
          {/* Column headers */}
          <div className="table-header">
            <div className="header-cell">Opportunity Name</div>
            <div className="header-cell">Match Percentage</div>
            <div className="header-cell"></div>
            <div className="header-cell">Application Progress</div>
            <div className="header-cell"></div>
            <div className="header-cell">Deadline</div>
            <div className="header-cell">Action</div>
          </div>

          {loading ? (
            <div className="loading-state p-8 text-center text-gray-500">
              Loading opportunities...
            </div>
          ) : error ? (
            <div className="error-state p-8 text-center text-red-500">
              {error}
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="empty-state p-8 text-center text-gray-500">
              {searchTerm ? 
                'No opportunities found matching your search.' : 
                'No opportunities yet.'}
            </div>
          ) : (
            currentItems.map(opportunity => (
              <div key={opportunity.id} className="table-row">
                {/* Name column */}
                <div className="cell">
                  <span className="opportunity-name">{opportunity.title}</span>
                </div>
                {/* Match percentage with animated progress bar */}
                <div className="cell">
                  <div className="progress-container">
                    <div className="progress-bar match">
                      <div 
                        className="progress-fill"
                        style={{ 
                          '--target-width': `${opportunity.matchPercentage}%`
                        }}
                      />
                    </div>
                    <span className="progress-text">
                      <AnimatedNumber value={opportunity.matchPercentage} />%
                    </span>
                  </div>
                </div>
                <div className="cell"></div>
                {/* Application progress with animated bar */}
                <div className="cell">
                  <div className="progress-container">
                    <div className="progress-bar application">
                      <div 
                        className="progress-fill"
                        style={{ 
                          '--target-width': `${opportunity.applicationProgress}%`
                        }}
                      />
                    </div>
                    <span className="progress-text">
                      <AnimatedNumber value={opportunity.applicationProgress} />%
                    </span>
                  </div>
                </div>
                <div className="cell"></div>
                {/* Deadline display */}
                <div className="cell deadline-cell">
                  <FiChevronDown className="deadline-icon" />
                  {formatDate(opportunity.deadline)}
                </div>
                {/* Action button */}
                <div className="cell">
                  <button 
                    className="apply-now-btn"
                    onClick={() => handleApplyClick(opportunity)}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination controls */}
        <div className="pagination">
          <button 
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <button 
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      </div>

      {/* Slide panel for detailed view */}
      <SlidePanel 
        isOpen={!!selectedOpportunity} 
        onClose={() => setSelectedOpportunity(null)}
        opportunity={selectedOpportunity}
      >
        {selectedOpportunity && (
          <OpportunityDetails 
            opportunity={selectedOpportunity}
            onClose={() => setSelectedOpportunity(null)}
          />
        )}
      </SlidePanel>
    </div>
  );
};

export default NewOpportunities;