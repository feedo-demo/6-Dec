/**
 * DataManagement Component
 * Features:
 * - Dynamic sections based on user's profile type
 * - Questions from admin configuration
 * - Progress tracking
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import DataSubmission from '../Dashboard/sections/DataSubmission/DataSubmission';
import './DataManagement.css';
import SectionForm from './SectionForm/SectionForm';
import { eventEmitter, EVENTS } from '../../../services/eventEmitter';

const DataManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || '');

  // Fetch sections data
  const fetchSections = async () => {
    try {
      setLoading(true);
      if (!user?.profile?.userType) {
        setSections([]);
        setLoading(false);
        return;
      }

      const profilesDocRef = doc(db, 'admin', 'profiles');
      const profilesDoc = await getDoc(profilesDocRef);
      
      if (!profilesDoc.exists()) {
        setSections([]);
        setLoading(false);
        return;
      }

      const data = profilesDoc.data();
      const userProfileType = data.profileTypes[user.profile.userType];
      
      if (!userProfileType?.sections) {
        setSections([]);
        setLoading(false);
        return;
      }

      const sectionsArray = Object.entries(userProfileType.sections).map(([id, section]) => ({
        id,
        ...section
      }));

      setSections(sectionsArray);
      
      // Set initial active tab if not set
      if (!activeTab && sectionsArray.length > 0) {
        setActiveTab(sectionsArray[0].id);
        setSearchParams({ tab: sectionsArray[0].id });
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setError('Failed to load sections. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSections();
  }, [user?.profile?.userType]);

  // Listen for section updates
  useEffect(() => {
    const unsubscribe = eventEmitter.on(EVENTS.SECTION_DATA_UPDATED, () => {
      console.log('Section data update event received');
      fetchSections();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Update URL when tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Listen for URL changes
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Render appropriate content based on active tab
  const renderTabContent = () => {
    const activeSection = sections.find(section => section.id === activeTab);
    if (!activeSection || !user) {
      console.log('No active section or user found');
      return null;
    }

    // Get the saved form data from user's profile sections
    const savedFormData = {};
    const sectionData = user?.profileSections?.[activeSection.id];
    
    console.log('Active section:', activeSection);
    console.log('Section data:', sectionData);

    // Initialize form data with default values for all questions
    if (activeSection.questions) {
      activeSection.questions.forEach(question => {
        if (!question || !question.id) {
          console.log('Invalid question found:', question);
          return;
        }

        try {
          if (question.type === 'repeater') {
            // Initialize repeater fields with at least one empty group
            const repeaterData = [];
            const existingData = sectionData?.questions?.find(q => q.id === question.id)?.answer;

            if (Array.isArray(existingData) && existingData.length > 0) {
              // Map existing data and ensure all required fields exist
              repeaterData.push(...existingData.map(group => ({
                ...Object.fromEntries(
                  (question.repeaterFields || []).map(field => [
                    field.id,
                    field.type === 'multipleChoice' ? [] : ''
                  ])
                ),
                ...group
              })));
            } else {
              // Create one empty group with all fields initialized
              repeaterData.push(
                Object.fromEntries(
                  (question.repeaterFields || []).map(field => [
                    field.id,
                    field.type === 'multipleChoice' ? [] : ''
                  ])
                )
              );
            }
            savedFormData[question.id] = repeaterData;
          } else if (question.type === 'multipleChoice') {
            const answer = sectionData?.questions?.find(q => q.id === question.id)?.answer;
            savedFormData[question.id] = Array.isArray(answer) ? answer : [];
          } else if (question.type === 'file') {
            savedFormData[question.id] = sectionData?.questions?.find(q => q.id === question.id)?.answer || null;
          } else {
            savedFormData[question.id] = sectionData?.questions?.find(q => q.id === question.id)?.answer || '';
          }
        } catch (error) {
          console.error('Error initializing question:', question.id, error);
          // Initialize with a safe default value based on question type
          savedFormData[question.id] = question.type === 'multipleChoice' ? [] : '';
        }
      });
    }

    console.log('Initialized form data:', savedFormData);

    return (
      <div className="tab-pane">
        <SectionForm 
          section={activeSection}
          profileType={user.userType}
          formData={savedFormData}
        />
      </div>
    );
  };

  if (loading && !sections.length) {
    return (
      <div className="data-management">
        <main className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
          </div>
        </main>
        <DataSubmission />
      </div>
    );
  }

  if (error) {
    return (
      <div className="data-management">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="data-management">
      <main className="main-content">
        <nav className="tab-nav">
          {sections.map(section => (
            <button
              key={section.id}
              className={`tab-button ${activeTab === section.id ? 'active' : ''}`}
              onClick={() => handleTabChange(section.id)}
            >
              {section.label}
            </button>
          ))}
        </nav>
        {renderTabContent()}
      </main>
      <DataSubmission />
    </div>
  );
};

export default DataManagement; 