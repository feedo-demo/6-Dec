/**
 * QuestionsList Component
 * 
 * Features:
 * - Displays list of questions
 * - Handles question reordering with visual feedback
 * - Question edit/delete actions
 * - Consistent question card styling
 * - Loading states and animations
 */

import React, { useState, useRef } from 'react';
import AdminButton from '../AdminButton/AdminButton';
import Button from '../../../components/Button/Button';
import AddQuestionModal from '../Models/AddQuestionModal/AddQuestionModal';
import ConfirmationModal from '../Models/ConfirmationModal/ConfirmationModal';
import './QuestionsList.css';

const QuestionsList = ({ questions, onAdd, onEdit, onDelete, onReorder }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const draggedOverItem = useRef(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    questionId: null,
    questionTitle: ''
  });
  const [isDragging, setIsDragging] = useState(false);

  // Question type icons mapping
  const typeIcons = {
    text: '✍️',
    textarea: '📝',
    singleChoice: '⭕',
    multipleChoice: '☑️',
    dropdown: '▼',
    date: '📅',
    file: '📎',
    repeater: '🔄'
  };

  const handleQuestionTypeSelect = (questionData) => {
    if (editingQuestion) {
      onEdit(editingQuestion.id, questionData);
    } else {
      onAdd(questionData);
    }
    setIsModalOpen(false);
    setEditingQuestion(null);
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (question) => {
    setDeleteConfirmation({
      isOpen: true,
      questionId: question.id,
      questionTitle: question.question
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmation.questionId) {
      onDelete(deleteConfirmation.questionId);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    setIsDragging(true);
    e.currentTarget.classList.add('dragging');
    // Set drag preview image
    const dragPreview = e.currentTarget.cloneNode(true);
    dragPreview.style.opacity = '0.5';
    document.body.appendChild(dragPreview);
    e.dataTransfer.setDragImage(dragPreview, 0, 0);
    setTimeout(() => document.body.removeChild(dragPreview), 0);
  };

  const handleDragEnter = (e, index) => {
    draggedOverItem.current = index;
    const cards = document.querySelectorAll('.question-card');
    cards.forEach((card, idx) => {
      if (idx === index) {
        card.classList.add('drag-over');
      } else {
        card.classList.remove('drag-over');
      }
    });
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    e.currentTarget.classList.remove('dragging');
    if (draggedItem !== null && draggedOverItem.current !== null) {
      onReorder(draggedItem, draggedOverItem.current);
    }
    setDraggedItem(null);
    draggedOverItem.current = null;
    // Clean up all drag-related classes
    document.querySelectorAll('.question-card').forEach(card => {
      card.classList.remove('drag-over', 'dragging');
    });
  };

  return (
    <div className="questions-list-container">
      <div className="questions-header">
        <div className="header-content">
          <h3>Questions</h3>
          <span className="question-count">
            {questions.length} {questions.length === 1 ? 'Question' : 'Questions'}
          </span>
        </div>
        <AdminButton
          variant="primary"
          className="min-w-[180px] ml-6"
          onClick={() => setIsModalOpen(true)}
        >
          Add New Question
        </AdminButton>
      </div>
      
      <div className={`questions-grid ${isDragging ? 'is-dragging' : ''}`}>
        {questions.map((question, index) => (
          <div 
            key={question.id} 
            className="question-card"
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="question-content">
              <span className="question-number">{index + 1}</span>
              <div className="drag-handle" title="Drag to reorder">⋮⋮</div>
              <div className="question-details">
                <div className="question-header">
                  <span className="question-type-icon">
                    {typeIcons[question.type]}
                  </span>
                  <h4>{question.question}</h4>
                </div>
                <p className="question-type">
                  {question.type === 'repeater' ? 'Group' : 
                    question.type.charAt(0).toUpperCase() + question.type.slice(1)}
                </p>
                {question.description && (
                  <p className="question-description">{question.description}</p>
                )}
                <div className="question-badges">
                  {question.required && (
                    <span className="required-badge">Required</span>
                  )}
                  {question.validation?.minLength > 0 && (
                    <span className="validation-badge">
                      Min: {question.validation.minLength}
                    </span>
                  )}
                  {question.validation?.maxLength < 1000 && (
                    <span className="validation-badge">
                      Max: {question.validation.maxLength}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="question-actions">
              <AdminButton
                variant="outline"
                className="min-w-[100px]"
                onClick={() => handleEdit(question)}
              >
                Edit
              </AdminButton>
              <AdminButton
                variant="danger"
                className="min-w-[100px]"
                onClick={() => handleDeleteClick(question)}
              >
                Delete
              </AdminButton>
            </div>
          </div>
        ))}
      </div>

      <AddQuestionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuestion(null);
        }}
        onSelectType={handleQuestionTypeSelect}
        editingQuestion={editingQuestion}
      />

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, questionId: null, questionTitle: '' })}
        onConfirm={handleDeleteConfirm}
        title="Delete Question"
        message={`Are you sure you want to delete the question "${deleteConfirmation.questionTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default QuestionsList; 