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
import React, { useState, useEffect } from 'react';

// Routing
import { useNavigate, useLocation } from 'react-router-dom';

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
    getDocs,     // Query executor
    setDoc,      // Document setter
    writeBatch,  // Batch writer
    serverTimestamp, // Server timestamp
    getDoc,
    deleteDoc,
} from 'firebase/firestore';

// Add AuthContext and update profile type
import { useAuth } from '../../../auth/AuthContext';

// Update imports
import { userOperations, createUserDataStructure } from '../../../auth/userManager';

const ProfileType = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedType, setSelectedType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Profile type selection handler
  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
  };

  // Check user state and handle redirects
  useEffect(() => {
    const checkUserState = async () => {
      console.log('ProfileType - Checking user state:', {
        user,
        authUser: auth.currentUser,
        isLoading,
        locationState: location.state
      });
      
      const fromSignup = location.state?.fromSignup;
      const userId = location.state?.userId;
      
      // If coming from signup and we have a userId, wait for user data
      if (fromSignup && userId) {
        if (!user || !auth.currentUser) {
          console.log('Waiting for user data...');
          // Wait briefly and check again
          const timer = setTimeout(checkUserState, 100);
          return () => clearTimeout(timer);
        }
        console.log('User data available:', user);
      } else if (!user && !auth.currentUser && !isLoading) {
        console.log('No user found, redirecting to login');
        navigate('/login', { replace: true });
        return;
      } else if (user && !user.isPending && !isLoading) {
        console.log('User already setup, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
        return;
      }
      
      console.log('Setting isInitializing to false');
      setIsInitializing(false);
    };

    checkUserState();
  }, [user, isLoading, navigate, location.state]);

  // Show loading state while checking user
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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

  // Next button handler
  // Saves selected profile type to Firestore and navigates to dashboard
  const handleNext = async () => {
    if (selectedType) {
      setIsLoading(true);
      try {
        const { data: pendingUserData } = await userOperations.getUserData(user.uid);
        
        if (!pendingUserData) {
          throw new Error('Pending user data not found');
        }

        // Create user data structure
        const userData = createUserDataStructure(
          user,
          {
            ...pendingUserData,
            userType: selectedType
          },
          selectedType
        );

        console.log('Converting pending user with data:', userData); // Debug log

        // Convert pending user to full user
        await userOperations.convertPendingToUser(user.uid, userData);

        console.log('Successfully converted user, updating profile...'); // Debug log

        // Update local user state
        await updateProfile(userData);

        console.log('Profile updated, navigating to dashboard...'); // Debug log

        // Navigate to dashboard
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('Error updating profile type:', error);
        // TODO: Add error handling UI
        // You might want to show an error message to the user here
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