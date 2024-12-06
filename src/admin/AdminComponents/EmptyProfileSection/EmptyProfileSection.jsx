/**
 * EmptyProfileSection Component
 * 
 * Features:
 * - Displays placeholder content when a section has no questions
 * - "Add Question" button integration
 * - Consistent styling with the rest of the application
 */

import React, { useState } from 'react';
import AdminButton from '../AdminButton/AdminButton';
import AddQuestionModal from '../Models/AddQuestionModal/AddQuestionModal';
import './EmptyProfileSection.css';

const EmptyProfileSection = ({ onAddClick, profileType, sectionId, sectionLabel }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleQuestionTypeSelect = (questionType) => {
    onAddClick(questionType);
  };

  return (
    <div className="section-content">
      <div className="section-content-container">
        <div className="section-placeholder">
          <p>No questions added yet</p>
          <p className="placeholder-details">
            Start by adding questions to "{sectionLabel}"
          </p>
          <AdminButton
            variant="primary"
            className="mt-6"
            onClick={() => setIsModalOpen(true)}
          >
            Add New Question
          </AdminButton>
        </div>
      </div>
      <AddQuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectType={handleQuestionTypeSelect}
        profileType={profileType}
        sectionId={sectionId}
      />
    </div>
  );
};

export default EmptyProfileSection; 