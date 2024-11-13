/**
 * Work Experience Tab Component
 * 
 * A form component for managing work experience information that provides:
 * - Company details
 * - Job role information
 * - Employment duration
 * - Responsibilities and achievements
 * - Multiple experience entries
 */

import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../../../../auth/AuthContext';
import './WorkExperience.css';
import Button from '../../../../components/Button/Button';

const emptyExperience = {
  companyName: '',
  jobTitle: '',
  startDate: '',
  endDate: '',
  isCurrentPosition: false,
  responsibilities: '',
  achievements: []
};

const WorkExperience = () => {
  const { user, updateProfile } = useAuth();
  const [experiences, setExperiences] = useState([{ ...emptyExperience }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  // Load existing work experience data
  useEffect(() => {
    if (user?.workExperience?.length > 0) {
      // Safely convert Firestore timestamp to date string
      const convertTimestampToDateString = (timestamp) => {
        if (!timestamp) return '';
        // Handle both Firestore Timestamp and regular Date objects
        const date = timestamp.seconds ? 
          new Date(timestamp.seconds * 1000) : 
          new Date(timestamp);
        
        // Check if date is valid before converting to ISO string
        return date instanceof Date && !isNaN(date) ? 
          date.toISOString().slice(0, 7) : 
          '';
      };

      setExperiences(user.workExperience.map(exp => ({
        ...exp,
        startDate: convertTimestampToDateString(exp.startDate),
        endDate: convertTimestampToDateString(exp.endDate)
      })));
    }
  }, [user]);

  // Handle input changes
  const handleChange = (index, field, value) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index] = {
      ...updatedExperiences[index],
      [field]: value
    };
    setExperiences(updatedExperiences);
  };

  // Handle current position toggle
  const handleCurrentPosition = (index, checked) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index] = {
      ...updatedExperiences[index],
      isCurrentPosition: checked,
      endDate: checked ? '' : updatedExperiences[index].endDate
    };
    setExperiences(updatedExperiences);
  };

  // Add new experience entry
  const addExperience = () => {
    setExperiences([...experiences, { ...emptyExperience }]);
  };

  // Remove experience entry
  const removeExperience = (index) => {
    const updatedExperiences = experiences.filter((_, i) => i !== index);
    setExperiences(updatedExperiences);
  };

  // Save work experience data
  const saveExperience = async () => {
    try {
      setLoading(true);
      setError(null);

      // Transform dates to Firestore timestamps
      const formattedExperiences = experiences.map(exp => {
        // Safely create Date objects
        const startDate = exp.startDate ? new Date(exp.startDate) : null;
        const endDate = exp.endDate && !exp.isCurrentPosition ? new Date(exp.endDate) : null;

        // Validate dates before including them
        return {
          ...exp,
          startDate: startDate instanceof Date && !isNaN(startDate) ? startDate : null,
          endDate: endDate instanceof Date && !isNaN(endDate) ? endDate : null
        };
      });

      await updateProfile({
        workExperience: formattedExperiences
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
      console.error('Error saving work experience:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-pane">
      {experiences.map((experience, index) => (
        <div key={index} className="experience-entry border-b pb-6 mb-6">
          <div className="form-group">
            <label className="required">Company Name</label>
            <input 
              type="text" 
              value={experience.companyName}
              onChange={(e) => handleChange(index, 'companyName', e.target.value)}
              placeholder="e.g., Google Inc." 
              maxLength={100}
              aria-label="Enter company name"
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label className="required">Job Title</label>
            <input 
              type="text" 
              value={experience.jobTitle}
              onChange={(e) => handleChange(index, 'jobTitle', e.target.value)}
              placeholder="e.g., Senior Software Engineer" 
              maxLength={100}
              aria-label="Enter job title"
              aria-required="true"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="required">Start Date</label>
              <input 
                type="month" 
                value={experience.startDate}
                onChange={(e) => handleChange(index, 'startDate', e.target.value)}
                aria-label="Select start date"
                aria-required="true"
              />
            </div>
            {!experience.isCurrentPosition && (
              <div className="form-group">
                <label>End Date</label>
                <input 
                  type="month" 
                  value={experience.endDate}
                  onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                  aria-label="Select end date"
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input 
                type="checkbox" 
                id={`currentPosition-${index}`}
                checked={experience.isCurrentPosition}
                onChange={(e) => handleCurrentPosition(index, e.target.checked)}
                aria-label="Current position"
              />
              <label htmlFor={`currentPosition-${index}`}>I currently work here</label>
            </div>
          </div>

          <div className="form-group">
            <label className="required">Responsibilities & Achievements</label>
            <textarea 
              value={experience.responsibilities}
              onChange={(e) => handleChange(index, 'responsibilities', e.target.value)}
              placeholder="Describe your key responsibilities and achievements..."
              maxLength={1000}
              aria-label="Enter responsibilities and achievements"
              aria-required="true"
            />
            <span className="char-limit">Max 1000 characters</span>
          </div>

          {experiences.length > 1 && (
            <button 
              type="button"
              onClick={() => removeExperience(index)}
              className="text-red-500 flex items-center gap-2 mt-4"
            >
              <FiTrash2 className="w-4 h-4" />
              <span>Remove Entry</span>
            </button>
          )}
        </div>
      ))}

      <Button
        type="button"
        onClick={addExperience}
        variant="outline"
        className="w-full"
      >
        <FiPlus className="w-4 h-4 inline-block mr-2" />
        Add Another Experience
      </Button>

      {/* Add success message */}
      {saved && (
        <div className="text-green-500 mt-4">
          Work experience saved successfully!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-red-500 mt-4">
          {error}
        </div>
      )}

      <Button
        type="button"
        onClick={saveExperience}
        isLoading={loading}
        disabled={loading}
        className="mt-6"
        variant="gradient-blue"
      >
        Save Work Experience
      </Button>
    </div>
  );
};

export default WorkExperience; 