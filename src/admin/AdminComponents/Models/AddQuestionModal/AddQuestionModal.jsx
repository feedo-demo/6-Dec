/**
 * AddQuestionModal Component
 * 
 * Features:
 * - Modal for adding/editing questions
 * - Question type selection
 * - Form integration
 */

import React, { useState } from 'react';
import AdminButton from '../../AdminButton/AdminButton';
import QuestionForm from '../../QuestionForm/QuestionForm';
import './AddQuestionModal.css';

const AddQuestionModal = ({ 
  isOpen, 
  onClose, 
  onSelectType, 
  editingQuestion,
  profileType,
  sectionId 
}) => {
  const [selectedType, setSelectedType] = useState(editingQuestion?.type || null);

  const questionTypes = [
    {
      id: 'repeater',
      label: 'Group Field',
      description: 'Add multiple sets of related fields',
      icon: '🔄'
    },
    {
      id: 'text',
      label: 'Text Input',
      description: 'Single line or paragraph text response',
      icon: '✍️'
    },
    {
      id: 'multipleChoice',
      label: 'Multiple Choice',
      description: 'Select multiple options from choices',
      icon: '☑️'
    },
    {
      id: 'dropdown',
      label: 'Dropdown',
      description: 'Select from a dropdown list',
      icon: '▼'
    },
    {
      id: 'file',
      label: 'File Upload',
      description: 'Upload documents or images',
      icon: '📎'
    },
    {
      id: 'date',
      label: 'Date',
      description: 'Date picker input',
      icon: '📅'
    }
  ];

  // Get the display name for the question type
  const getQuestionTypeDisplay = (type) => {
    switch (type) {
      case 'repeater':
        return 'Group';
      case 'multipleChoice':
        return 'Multiple Choice';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>
            {editingQuestion 
              ? `Edit ${getQuestionTypeDisplay(editingQuestion.type)} Question` 
              : 'Add New Question'
            }
          </h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-form-container">
          {!selectedType && !editingQuestion ? (
            <div className="question-types-grid">
              {questionTypes.map(type => (
                <button
                  key={type.id}
                  className="question-type-card"
                  onClick={() => setSelectedType(type.id)}
                >
                  <span className="question-type-icon">{type.icon}</span>
                  <h3>{type.label}</h3>
                  <p>{type.description}</p>
                </button>
              ))}
            </div>
          ) : (
            <QuestionForm
              questionType={selectedType || editingQuestion?.type}
              onSubmit={onSelectType}
              onCancel={() => {
                if (editingQuestion) {
                  onClose();
                } else {
                  setSelectedType(null);
                }
              }}
              initialData={editingQuestion}
              profileType={profileType}
              sectionId={sectionId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AddQuestionModal; 