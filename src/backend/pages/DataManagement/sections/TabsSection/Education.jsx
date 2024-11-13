/**
 * Education Tab Component
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../auth/AuthContext';
import Button from '../../../../components/Button/Button';

const Education = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    degreeLevel: '',
    fieldOfStudy: '',
    institutionName: '',
    graduationDate: '',
    gpa: '',
    academicAchievements: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  // Load existing education data
  useEffect(() => {
    if (user?.education) {
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

      setFormData({
        degreeLevel: user.education.degreeLevel || '',
        fieldOfStudy: user.education.fieldOfStudy || '',
        institutionName: user.education.institutionName || '',
        graduationDate: convertTimestampToDateString(user.education.graduationDate),
        gpa: user.education.gpa || '',
        academicAchievements: user.education.academicAchievements || ''
      });
    }
  }, [user]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setSaved(false);
  };

  // Save education data
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Create the education update object
      const educationUpdate = {
        education: {
          degreeLevel: formData.degreeLevel,
          fieldOfStudy: formData.fieldOfStudy,
          institutionName: formData.institutionName,
          graduationDate: formData.graduationDate ? new Date(formData.graduationDate) : null,
          gpa: formData.gpa ? parseFloat(formData.gpa) : null,
          academicAchievements: formData.academicAchievements,
          lastUpdated: new Date()
        }
      };

      // Update profile with education data
      await updateProfile(educationUpdate);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
      console.error('Error saving education data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="tab-pane">
      {/* Degree Level Input Group */}
      <div className="form-group">
        <label className="required">Degree Level</label>
        <select 
          name="degreeLevel"
          value={formData.degreeLevel}
          onChange={handleChange}
          aria-label="Select degree level"
          aria-required="true"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          required
        >
          <option value="">Select degree level</option>
          <option value="high_school">High School</option>
          <option value="associates">Associate's Degree</option>
          <option value="bachelors">Bachelor's Degree</option>
          <option value="masters">Master's Degree</option>
          <option value="doctorate">Doctorate</option>
        </select>
      </div>

      {/* Field of Study Input Group */}
      <div className="form-group">
        <label className="required">Field of Study</label>
        <input 
          type="text" 
          name="fieldOfStudy"
          value={formData.fieldOfStudy}
          onChange={handleChange}
          placeholder="e.g., Computer Science" 
          maxLength={100}
          aria-label="Enter field of study"
          aria-required="true"
          required
        />
      </div>

      {/* Institution Name Input Group */}
      <div className="form-group">
        <label className="required">Institution Name</label>
        <input 
          type="text" 
          name="institutionName"
          value={formData.institutionName}
          onChange={handleChange}
          placeholder="e.g., University of California" 
          maxLength={100}
          aria-label="Enter institution name"
          aria-required="true"
          required
        />
      </div>

      {/* Graduation Date Input Group */}
      <div className="form-group">
        <label className="required">Graduation Date</label>
        <input 
          type="month" 
          name="graduationDate"
          value={formData.graduationDate}
          onChange={handleChange}
          aria-label="Select graduation date"
          aria-required="true"
          required
        />
      </div>

      {/* GPA Input Group */}
      <div className="form-group">
        <label>GPA</label>
        <input 
          type="number" 
          name="gpa"
          value={formData.gpa}
          onChange={handleChange}
          step="0.01" 
          min="0" 
          max="4.0" 
          placeholder="e.g., 3.5"
          aria-label="Enter GPA"
        />
      </div>

      {/* Academic Achievements Input Group */}
      <div className="form-group">
        <label>Academic Achievements</label>
        <textarea 
          name="academicAchievements"
          value={formData.academicAchievements}
          onChange={handleChange}
          placeholder="List any honors, awards, or notable academic achievements..."
          maxLength={500}
          aria-label="Enter academic achievements"
        />
        <span className="char-limit">
          {formData.academicAchievements.length}/500 characters
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-500 mt-4">
          {error}
        </div>
      )}

      {/* Success Message */}
      {saved && (
        <div className="text-green-500 mt-4">
          Education information saved successfully!
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        isLoading={loading}
        disabled={loading}
        className="mt-6"
        variant="gradient-blue"
      >
        Save Education Information
      </Button>
    </form>
  );
};

export default Education; 