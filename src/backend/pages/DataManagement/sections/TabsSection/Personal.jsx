/**
 * Personal Tab Component
 * 
 * A form component for managing personal information that provides:
 * - Full name, email address, phone number, professional summary, and location inputs
 * - Character limits and validation
 * - AI-powered rewrite functionality
 * - Interactive UI elements
 * - Real-time validation
 * 
 * Features:
 * - Input validation
 * - Character counting
 * - AI rewrite capability
 * - Responsive design
 * - Error handling
 */

import React, { useState, useEffect } from 'react';
import { FiZap } from 'react-icons/fi';
import { useAuth } from '../../../../../auth/AuthContext';
import Button from '../../../../components/Button/Button';

const Personal = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    professionalSummary: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  // Load existing personal data
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.profile?.firstName && user.profile?.lastName ? 
          `${user.profile.firstName} ${user.profile.lastName}` :
          user.metadata?.firstName && user.metadata?.lastName ?
          `${user.metadata.firstName} ${user.metadata.lastName}` : '',
        email: user.profile?.email || user.metadata?.email || '',
        phoneNumber: user.profile?.phoneNumber || user.metadata?.phoneNumber || '',
        professionalSummary: user.profile?.professionalSummary || '',
        location: user.profile?.location || user.metadata?.location || ''
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

  // Handle AI rewrite
  const handleRewrite = async () => {
    // AI rewrite functionality to be implemented
    console.log('AI Rewrite clicked');
  };

  // Save personal data
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const [firstName = '', ...lastNameParts] = formData.fullName.split(' ');
      const lastName = lastNameParts.join(' ');

      // Create the complete profile update object
      const profileUpdate = {
        profile: {
          firstName,
          lastName,
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          professionalSummary: formData.professionalSummary,
          location: formData.location,
          lastUpdated: new Date()
        },
        metadata: {
          firstName,
          lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          location: formData.location,
          lastUpdated: new Date()
        }
      };

      // Update both profile and metadata
      await updateProfile(profileUpdate);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
      console.error('Error saving personal data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="tab-pane w-full">
      {/* Name and Email (2 in one line) */}
      <div className="grid grid-cols-2 gap-6">
        {/* Full Name Input Group */}
        <div className="form-group">
          <label className="required">Full Name</label>
          <input 
            type="text" 
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="John Doe" 
            maxLength={100}
            aria-label="Enter full name"
            aria-required="true"
            required
          />
        </div>

        {/* Email Input Group */}
        <div className="form-group">
          <label className="required">Email Address</label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john.doe@example.com" 
            aria-label="Enter email address"
            aria-required="true"
            required
          />
        </div>
      </div>

      {/* Phone and Location (2 in one line) */}
      <div className="grid grid-cols-2 gap-6">
        {/* Phone Number Input Group */}
        <div className="form-group">
          <label className="required">Phone Number</label>
          <input 
            type="tel" 
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000" 
            aria-label="Enter phone number"
            aria-required="true"
            required
          />
        </div>

        {/* Location Input Group */}
        <div className="form-group">
          <label className="required">Location</label>
          <input 
            type="text" 
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City, Country" 
            maxLength={100}
            aria-label="Enter location"
            aria-required="true"
            required
          />
        </div>
      </div>

      {/* Professional Summary Input Group - Full Width */}
      <div className="form-group mt-6">
        <label className="required">Professional Summary</label>
        <textarea 
          name="professionalSummary"
          value={formData.professionalSummary}
          onChange={handleChange}
          placeholder="Brief overview of your professional background and key strengths..."
          maxLength={500}
          aria-label="Enter professional summary"
          aria-required="true"
          required
        />
        <span className="char-limit">
          {formData.professionalSummary.length}/500 characters
        </span>
        <button 
          type="button"
          onClick={handleRewrite} 
          className="rewrite-btn" 
          aria-label="Rewrite summary using AI"
        >
          <FiZap className="w-4 h-4" />
          <span>Rewrite</span>
        </button>
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
          Personal information saved successfully!
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
        Save Personal Information
      </Button>
    </form>
  );
};

/**
 * Export the Personal component
 * This component provides:
 * - Personal information form fields
 * - Character limit tracking
 * - AI-powered content rewriting
 * - Input validation
 * - Responsive design
 * - Accessibility features
 */
export default Personal; 