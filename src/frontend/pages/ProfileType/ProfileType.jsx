/**
 * Profile Type Selection Page Component
 * Features:
 * - First-time user profile type selection
 * - Interactive profile cards with hover effects
 * - Smooth animations and transitions
 * - Responsive design
 * - Progress tracking
 */

// React core imports
import React, { useState } from 'react';

// Routing
import { useNavigate } from 'react-router-dom';

// Icon imports from react-icons
import { 
    FiBriefcase,  // Briefcase icon for Entrepreneur
    FiBook,       // Book icon for Student
    FiUser,       // User icon for Job Seeker
    FiHome        // Home icon for Company
} from 'react-icons/fi';

// Static assets
import feedoLogo from '../../assets/images/feedo-logo.png';     // Company logo
import girlImage from '../../assets/images/girl.png';           // Hero image
import awardBadge from '../../assets/images/award-badge.png';   // Award badge for achievements

// Styles
import './ProfileType.css';

// Firebase imports
import { db, auth } from '../../../firebase/config';  // Firebase instances

// Firestore database methods
import { 
    doc,         // Document reference
    updateDoc,   // Document updater
    query,       // Query creator
    collection,  // Collection reference
    where,       // Query condition
    getDocs      // Query executor
} from 'firebase/firestore';

// Add AuthContext and update profile type
import { useAuth } from '../../../auth/AuthContext';

const ProfileType = () => {
  // Navigation hook for routing
  const navigate = useNavigate();

  const { user, updateProfile } = useAuth();

  // State management
  const [selectedType, setSelectedType] = useState(null);  // Selected profile type
  const [isLoading, setIsLoading] = useState(false);      // Loading state for async operations

  // Profile types configuration array
  // Defines available profile types with their properties
  const profileTypes = [
    {
      id: 'entrepreneur',
      icon: FiBriefcase,
      title: 'Entrepreneur',
      description: 'Looking for Investment'
    },
    {
      id: 'student',
      icon: FiBook,
      title: 'Student',
      description: 'Looking for Scholarships'
    },
    {
      id: 'jobseeker',
      icon: FiUser,
      title: 'Job Seeker',
      description: 'Looking for Employment'
    },
    {
      id: 'company',
      icon: FiHome,
      title: 'Company',
      description: 'Looking for Tenders'
    }
  ];

  // Profile type selection handler
  // Updates selected type state when user clicks a profile card
  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
  };

  // Next button handler
  // Saves selected profile type to Firestore and navigates to dashboard
  const handleNext = async () => {
    if (selectedType) {
      setIsLoading(true);
      try {
        await updateProfile({ profileType: selectedType });
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('Error updating profile type:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="profile-type-container">
      {/* Left section with logo and decorative elements */}
      <div className="profile-type-left">
        <img src={feedoLogo} alt="Feedo AI Logo" className="feedo-logo" />
        <div className="hero-image">
          <img src={girlImage} alt="Professional woman with laptop" />
        </div>
        <div className="award-badges">
          <img src={awardBadge} alt="Award Badge" />
          <img src={awardBadge} alt="Award Badge" />
          <img src={awardBadge} alt="Award Badge" />
        </div>
      </div>
      
      {/* Right section with profile type selection */}
      <div className="profile-type-right">
        <div className="profile-type-content">
          {/* Header section */}
          <h1 className="welcome-title">Welcome!</h1>
          <h2 className="selection-title">Select Your Profile to Get Started</h2>
          <p className="selection-description">
            Choose your profile type to receive personalized opportunities tailored to your needs.
          </p>

          {/* Profile type selection grid */}
          <div className="profile-type-grid">
            {profileTypes.map((type) => (
              <button
                key={type.id}
                className={`profile-type-card ${selectedType === type.id ? 'selected' : ''}`}
                onClick={() => handleTypeSelect(type.id)}
              >
                <div className="card-icon">
                  <type.icon size={28} />
                </div>
                <h3 className="card-title">{type.title}</h3>
                <p className="card-description">{type.description}</p>
              </button>
            ))}
          </div>

          {/* Continue button */}
          <button 
            className={`next-button ${isLoading ? 'loading' : ''}`}
            onClick={handleNext}
            disabled={!selectedType || isLoading}
          >
            <span>{isLoading ? '' : selectedType ? 'Continue' : 'Select a profile type'}</span>
          </button>
        </div>

        {/* Footer section */}
        <footer className="profile-type-footer">
          <div className="copyright">
            Copyright 2021 - 2022 Feedo Inc. All rights Reserved
          </div>
          <button className="help-btn">
            Need help?
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ProfileType;