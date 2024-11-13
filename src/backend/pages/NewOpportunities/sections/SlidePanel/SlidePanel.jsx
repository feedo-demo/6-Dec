/**
 * SlidePanel Component
 * 
 * Purpose: Creates a sliding panel overlay for displaying detailed opportunity information
 * with Firestore integration for saving opportunities
 */

import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { db } from '../../../../../firebase/config';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../../../../auth/AuthContext';
import OpportunityDetails from '../OpportunityDetails/OpportunityDetails';
import './SlidePanel.css';

const SlidePanel = ({ isOpen, onClose, opportunity }) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if opportunity is saved when component mounts or opportunity changes
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!user?.profile?.authUid || !opportunity?.id) return;

      try {
        const savedRef = doc(db, 'users', user.profile.authUid, 'saved_opportunities', opportunity.id);
        const savedDoc = await getDoc(savedRef);
        setIsSaved(savedDoc.exists());
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
    };

    checkIfSaved();
  }, [user?.profile?.authUid, opportunity?.id]);

  // Handle save/unsave opportunity
  const handleSaveOpportunity = async () => {
    if (!user?.profile?.authUid || !opportunity?.id) return;

    setIsLoading(true);
    try {
      const savedRef = doc(db, 'users', user.profile.authUid, 'saved_opportunities', opportunity.id);

      if (isSaved) {
        // Unsave opportunity
        await deleteDoc(savedRef);
        setIsSaved(false);
      } else {
        // Save opportunity with only existing fields
        const savedData = {
          opportunityId: opportunity.id,
          savedAt: new Date().toISOString(),
          title: opportunity.title || '',
          deadline: opportunity.deadline || '',
          status: opportunity.status || '',
          matchPercentage: opportunity.matchPercentage || 0,
          location: opportunity.location || {},
          compensation: opportunity.compensation || {}
        };

        await setDoc(savedRef, savedData);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving opportunity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date)) {
        console.error('Invalid date string:', dateString);
        return 'Date not available';
      }

      const now = new Date();
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays > 0 && diffDays <= 7) return `${diffDays} days left`;

      const options = { 
        month: 'long',
        day: 'numeric', 
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      };
      
      return new Intl.DateTimeFormat('en-US', options).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date not available';
    }
  };

  // Format currency for display
  const formatCurrency = (amount, currency = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="slide-panel-overlay" onClick={onClose}>
      <div className="slide-panel-wrapper" onClick={e => e.stopPropagation()}>
        <button 
          className="slide-panel-close-btn"
          onClick={onClose}
          aria-label="Close panel"
        >
          <FiX className="w-6 h-6" />
        </button>
        
        <div className="slide-panel-content">
          {opportunity && (
            <OpportunityDetails 
              opportunity={{
                ...opportunity,
                formattedDeadline: formatDate(opportunity.deadline),
                formattedSalary: opportunity.compensation?.amount ? 
                  formatCurrency(opportunity.compensation.amount, opportunity.compensation.currency) : 
                  'Not specified',
                isSaved,
                isLoading,
                onSave: handleSaveOpportunity
              }}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SlidePanel;