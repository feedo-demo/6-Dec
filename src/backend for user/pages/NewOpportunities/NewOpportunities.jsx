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

import React, { useState } from 'react';
// Icon component for visual indicators
import { FiChevronDown } from 'react-icons/fi';
// Custom components for page sections
import StatCards from './sections/StatCards/StatCards';
import './NewOpportunities.css';
// Animated number component for dynamic values
import AnimatedNumber from '../../components/Animated/AnimatedNumber';
// Navigation hook for routing
import { useNavigate } from 'react-router-dom';
// Panel components for detailed views
import SlidePanel from './sections/SlidePanel/SlidePanel';
import OpportunityDetails from './sections/OpportunityDetails/OpportunityDetails';

const NewOpportunities = () => {
  // State for search functionality
  const [searchTerm, setSearchTerm] = useState('');
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Changed from 5 to 10 items per page
  const navigate = useNavigate();
  // State for selected opportunity details
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  // Updated sample data with more entries and unique descriptions
  const opportunities = [
    {
      id: 1,
      name: "AI Innovation Grant",
      description: "Research funding...",
      matchPercentage: 95,
      applicationProgress: 40,
      deadline: "Oct 7, 2024",
      status: "active"
    },
    {
      id: 2,
      name: "Tech Startup Accelerator",
      description: "Startup support...",
      matchPercentage: 88,
      applicationProgress: 60,
      deadline: "Oct 15, 2024",
      status: "closing-soon"
    },
    {
      id: 3,
      name: "Digital Innovation Fund",
      description: "Tech funding...",
      matchPercentage: 92,
      applicationProgress: 25,
      deadline: "Nov 1, 2024",
      status: "new"
    },
    {
      id: 4,
      name: "Research Fellowship Program",
      description: "Academic grant...",
      matchPercentage: 85,
      applicationProgress: 75,
      deadline: "Oct 30, 2024",
      status: "active"
    },
    {
      id: 5,
      name: "Sustainability Grant",
      description: "Green initiatives...",
      matchPercentage: 78,
      applicationProgress: 90,
      deadline: "Nov 15, 2024",
      status: "new"
    },
    {
      id: 6,
      name: "Women in Tech Scholarship",
      description: "Education support...",
      matchPercentage: 91,
      applicationProgress: 15,
      deadline: "Dec 1, 2024",
      status: "active"
    },
    {
      id: 7,
      name: "Cloud Innovation Award",
      description: "Cloud projects...",
      matchPercentage: 87,
      applicationProgress: 45,
      deadline: "Nov 20, 2024",
      status: "new"
    },
    {
      id: 8,
      name: "Social Impact Grant",
      description: "Community projects...",
      matchPercentage: 82,
      applicationProgress: 70,
      deadline: "Dec 15, 2024",
      status: "active"
    },
    {
      id: 9,
      name: "Cybersecurity Fellowship",
      description: "Security research...",
      matchPercentage: 94,
      applicationProgress: 30,
      deadline: "Nov 30, 2024",
      status: "closing-soon"
    },
    {
      id: 10,
      name: "Healthcare Innovation Fund",
      description: "Medical tech...",
      matchPercentage: 89,
      applicationProgress: 55,
      deadline: "Dec 5, 2024",
      status: "new"
    },
    {
      id: 11,
      name: "Blockchain Innovation Grant",
      description: "DeFi projects...",
      matchPercentage: 86,
      applicationProgress: 20,
      deadline: "Dec 10, 2024",
      status: "new"
    },
    {
      id: 12,
      name: "EdTech Development Fund",
      description: "Education tech...",
      matchPercentage: 93,
      applicationProgress: 65,
      deadline: "Dec 20, 2024",
      status: "active"
    },
    {
      id: 13,
      name: "Clean Energy Accelerator",
      description: "Renewable energy...",
      matchPercentage: 88,
      applicationProgress: 35,
      deadline: "Jan 5, 2025",
      status: "new"
    },
    {
      id: 14,
      name: "IoT Innovation Program",
      description: "Smart devices...",
      matchPercentage: 91,
      applicationProgress: 50,
      deadline: "Dec 25, 2024",
      status: "active"
    },
    {
      id: 15,
      name: "FinTech Startup Grant",
      description: "Financial tech...",
      matchPercentage: 84,
      applicationProgress: 80,
      deadline: "Jan 10, 2025",
      status: "closing-soon"
    },
    {
      id: 16,
      name: "AR/VR Development Fund",
      description: "Immersive tech...",
      matchPercentage: 89,
      applicationProgress: 45,
      deadline: "Jan 15, 2025",
      status: "new"
    },
    {
      id: 17,
      name: "Space Tech Initiative",
      description: "Space research...",
      matchPercentage: 87,
      applicationProgress: 25,
      deadline: "Jan 20, 2025",
      status: "active"
    },
    {
      id: 18,
      name: "Quantum Computing Grant",
      description: "Quantum tech...",
      matchPercentage: 96,
      applicationProgress: 70,
      deadline: "Dec 30, 2024",
      status: "closing-soon"
    },
    {
      id: 19,
      name: "Robotics Research Fund",
      description: "Robotics dev...",
      matchPercentage: 92,
      applicationProgress: 55,
      deadline: "Jan 25, 2025",
      status: "new"
    },
    {
      id: 20,
      name: "Digital Health Grant",
      description: "Health tech...",
      matchPercentage: 90,
      applicationProgress: 40,
      deadline: "Jan 30, 2025",
      status: "active"
    }
  ];

  // Filter opportunities based on search term
  // Performs case-insensitive search on name and description
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchTerm.toLowerCase());
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
      {/* Top statistics cards */}
      <StatCards type="opportunities" />
      
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

          {/* Opportunity rows with dynamic data */}
          {currentItems.map(opportunity => (
            <div key={opportunity.id} className="table-row">
              {/* Name column */}
              <div className="cell">
                <span className="opportunity-name">{opportunity.name}</span>
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
                {opportunity.deadline}
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
          ))}
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