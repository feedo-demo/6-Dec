/**
 * QuestionForm Component
 * 
 * Features:
 * - Dynamic form generation based on question type
 * - Form validation and error handling
 * - Support for all question types including repeater fields
 * - Real-time validation feedback
 */

import React, { useState, useEffect } from 'react';
import AdminButton from '../AdminButton/AdminButton';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import './QuestionForm.css';
import { FiPlus, FiTrash2, FiMove } from 'react-icons/fi';
import EnhanceWithAI from '../../../components/EnhanceWithAI/EnhanceWithAI';

const QuestionForm = ({ 
  questionType, 
  onSubmit, 
  onCancel, 
  initialData,
  profileType,
  sectionId 
}) => {
  const [formData, setFormData] = useState({
    id: Date.now().toString(),
    question: '',
    type: questionType,
    required: false,
    order: 0,
    width: '100',
    options: [''],
    inputType: 'text',
    enableRewrite: false,
    allowMultipleGroups: false,
    groupFields: [
      {
        id: Date.now(),
        label: '',
        type: 'text',
        required: false,
        width: '100',
        options: ['']
      }
    ],
    validation: {
      minLength: 0,
      maxLength: 100,
      pattern: '',
      minGroups: 1,
      maxGroups: 1
    }
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        inputType: initialData.inputType || 'text',
        enableRewrite: initialData.enableRewrite || false,
        options: initialData.options || [''],
        allowMultipleGroups: initialData.allowMultipleGroups ?? false,
        groupFields: initialData.repeaterFields?.map(field => ({
          ...field,
          options: ['dropdown', 'singleChoice', 'multipleChoice'].includes(field.type) 
            ? (field.options || [''])
            : ['']
        })) || [
          {
            id: Date.now(),
            label: '',
            type: 'text',
            required: false,
            width: '100',
            options: ['']
          }
        ],
        validation: {
          ...initialData.validation,
          minLength: initialData.validation?.minLength || 0,
          maxLength: initialData.validation?.maxLength || 
                    (initialData.inputType === 'textarea' ? 500 : 100),
          minGroups: initialData.validation?.minGroups || 
                    initialData.validation?.minRepeats || 1,
          maxGroups: initialData.validation?.maxGroups || 
                    initialData.validation?.maxRepeats || 
                    (initialData.allowMultipleGroups ? 10 : 1)
        }
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.question.trim()) {
      newErrors.question = 'Question is required';
    }

    if (['multipleChoice', 'checkbox', 'dropdown', 'radio'].includes(questionType)) {
      if (formData.options.length < 2) {
        newErrors.options = 'At least two options are required';
      }
      if (formData.options.some(opt => !opt.trim())) {
        newErrors.options = 'All options must have a value';
      }
    }

    if (formData.validation) {
      if (formData.validation.minLength > formData.validation.maxLength) {
        newErrors.validation = 'Minimum length cannot be greater than maximum length';
      }
      if (formData.validation.pattern) {
        try {
          new RegExp(formData.validation.pattern);
        } catch (e) {
          newErrors.validation = 'Invalid regular expression pattern';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      
      // Clean repeater fields data
      const cleanGroupFields = formData.groupFields.map(field => {
        const cleanField = {
          id: field.id,
          label: field.label.trim(),
          type: field.type,
          required: field.required,
          width: field.width || '100'
        };

        // Add options array for choice-based fields
        if (['dropdown', 'multipleChoice'].includes(field.type)) {
          cleanField.options = (field.options || []).filter(opt => opt.trim());
        }

        // Add enableRewrite for textarea fields
        if (field.type === 'textarea') {
          cleanField.enableRewrite = field.enableRewrite || false;
        }

        return cleanField;
      });

      const cleanData = {
        id: formData.id,
        question: formData.question.trim(),
        type: questionType,
        required: formData.required,
        order: formData.order,
        width: formData.width,
        updatedAt: new Date().toISOString(),
        
        // Add inputType and enableRewrite for text questions
        ...(questionType === 'text' && {
          inputType: formData.inputType || 'text',
          enableRewrite: formData.inputType === 'textarea' ? (formData.enableRewrite || false) : false
        }),
        
        // Add options for choice-based questions
        ...((['multipleChoice', 'dropdown'].includes(questionType)) && {
          options: formData.options.filter(opt => opt.trim())
        }),
        
        // Add validation for text inputs
        ...((['text', 'textarea'].includes(questionType)) && {
          validation: {
            minLength: parseInt(formData.validation.minLength) || 0,
            maxLength: parseInt(formData.validation.maxLength) || 1000,
            pattern: formData.validation.pattern
          }
        }),
        
        // Add repeater fields configuration with options and validation
        ...(questionType === 'repeater' && {
          repeaterFields: cleanGroupFields,
          allowMultipleGroups: formData.allowMultipleGroups,
          validation: {
            minGroups: parseInt(formData.validation.minGroups) || 1,
            maxGroups: parseInt(formData.validation.maxGroups) || (formData.allowMultipleGroups ? 10 : 1)
          }
        })
      };

      console.log('Submitting question data:', cleanData); // Debug log

      const success = await onSubmit(cleanData);
      
      if (success) {
        onCancel();
      }
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
    if (errors.options) {
      setErrors({ ...errors, options: null });
    }
  };

  const addOption = () => {
    setFormData({ 
      ...formData, 
      options: [...formData.options, ''] 
    });
  };

  const removeOption = (index) => {
    if (formData.options.length > 1) {
      setFormData({
        ...formData,
        options: formData.options.filter((_, i) => i !== index)
      });
    }
  };

  const handleAddGroupField = () => {
    setFormData({
      ...formData,
      groupFields: [
        ...formData.groupFields,
        {
          id: Date.now(),
          label: '',
          type: 'text',
          required: false,
          width: '100'
        }
      ]
    });
  };

  const handleRemoveGroupField = (index) => {
    if (formData.groupFields.length > 1) {
      setFormData({
        ...formData,
        groupFields: formData.groupFields.filter((_, i) => i !== index)
      });
    }
  };

  const handleGroupFieldChange = (index, field, value) => {
    const newGroupFields = [...formData.groupFields];
    const currentField = { ...newGroupFields[index] }; // Create a deep copy of the current field

    if (field === 'type') {
      // If changing to a choice-based type
      if (['dropdown', 'multipleChoice'].includes(value)) {
        newGroupFields[index] = {
          ...currentField,
          type: value,
          options: currentField.options || [''] // Initialize options if not exists
        };
      } else if (value === 'textarea') {
        // If changing to textarea, initialize with enableRewrite field
        const { options, ...restField } = currentField;
        newGroupFields[index] = {
          ...restField,
          type: value,
          enableRewrite: false // Initialize enableRewrite as false
        };
      } else {
        // If changing from a choice-based type to another type
        const { options, enableRewrite, ...restField } = currentField;
        newGroupFields[index] = {
          ...restField,
          type: value
        };
      }
    } else if (field === 'enableRewrite') {
      // Special handling for enableRewrite checkbox
      newGroupFields[index] = {
        ...currentField,
        enableRewrite: value
      };
    } else {
      // For other field changes
      newGroupFields[index] = {
        ...currentField,
        [field]: value,
        // Preserve options array for choice-based fields
        ...((['dropdown', 'multipleChoice'].includes(currentField.type) && currentField.options) && {
          options: currentField.options
        })
      };
    }

    setFormData({
      ...formData,
      groupFields: newGroupFields
    });

    // Debug log to check the state after update
    console.log('Updated field:', newGroupFields[index]);
  };

  const getPlaceholderExample = (index) => {
    const examples = [
      'e.g., School Name',
      'e.g., Degree/Qualification',
      'e.g., Field of Study',
      'e.g., Start Date',
      'e.g., End Date',
      'e.g., Grade/Score',
      'e.g., Description',
      'e.g., Location',
      'e.g., Achievement',
      'e.g., Additional Details'
    ];
    
    return examples[index % examples.length];
  };

  const renderValidationFields = () => {
    if (['text', 'textarea'].includes(questionType)) {
      return (
        <div className="validation-fields">
          <h4 className="validation-title">Validation Rules</h4>
          <div className="validation-grid">
            <div className="validation-row">
              <div className="form-group">
                <label className="form-label">Minimum Length</label>
                <input
                  type="number"
                  min="0"
                  value={formData.validation.minLength}
                  onChange={(e) => setFormData({
                    ...formData,
                    validation: {
                      ...formData.validation,
                      minLength: parseInt(e.target.value) || 0
                    }
                  })}
                  className={`form-input ${errors.validation ? 'error' : ''}`}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Maximum Length</label>
                <input
                  type="number"
                  min="0"
                  value={formData.validation.maxLength}
                  onChange={(e) => setFormData({
                    ...formData,
                    validation: {
                      ...formData.validation,
                      maxLength: parseInt(e.target.value) || 0
                    }
                  })}
                  className={`form-input ${errors.validation ? 'error' : ''}`}
                />
              </div>
            </div>
          </div>
          {errors.validation && (
            <p className="error-message">{errors.validation}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderGroupFields = () => {
    if (questionType === 'repeater') {
      return (
        <div className="group-fields-section">
          <h3 className="section-title">Group Fields</h3>
          <p className="helper-text mb-4">
            Configure the fields that will be included in each group.
          </p>

          <div className="group-settings mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Group Settings</h4>
            
            <div className="form-checkbox mb-4">
              <input
                type="checkbox"
                checked={formData.allowMultipleGroups}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  allowMultipleGroups: e.target.checked,
                  validation: {
                    ...prev.validation,
                    maxGroups: e.target.checked ? 10 : 1,
                    minGroups: 1
                  }
                }))}
              />
              <span>Allow multiple groups</span>
            </div>

            {formData.allowMultipleGroups && (
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="text-sm">Minimum Groups</label>
                  <input
                    type="number"
                    min="1"
                    max={formData.validation.maxGroups}
                    value={formData.validation.minGroups}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      validation: {
                        ...prev.validation,
                        minGroups: parseInt(e.target.value) || 1
                      }
                    }))}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="text-sm">Maximum Groups</label>
                  <input
                    type="number"
                    min={formData.validation.minGroups}
                    value={formData.validation.maxGroups}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      validation: {
                        ...prev.validation,
                        maxGroups: parseInt(e.target.value) || 10
                      }
                    }))}
                    className="form-input"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="group-fields space-y-4">
            {formData.groupFields.map((field, index) => (
              <div key={field.id} className="group-field-item">
                <div className="field-header">
                  <div className="drag-handle">
                    <FiMove className="text-gray-400" />
                  </div>
                  <div className="field-content">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-group">
                        <label>Field Label</label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => handleGroupFieldChange(index, 'label', e.target.value)}
                          placeholder={getPlaceholderExample(index)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Field Type</label>
                        <select
                          value={field.type}
                          onChange={(e) => handleGroupFieldChange(index, 'type', e.target.value)}
                          className="form-input"
                        >
                          <option value="text">Single Line Text</option>
                          <option value="textarea">Multi-line Text</option>
                          <option value="date">Date</option>
                          <option value="dropdown">Dropdown</option>
                          <option value="multipleChoice">Multiple Choice</option>
                          <option value="file">File Upload</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="field-width mt-4">
                      <label className="text-sm font-medium text-gray-700 mb-2">Field Width</label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`width-${field.id}`}
                            value="50"
                            checked={field.width === '50'}
                            onChange={(e) => handleGroupFieldChange(index, 'width', e.target.value)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-600">Half Width (50%)</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`width-${field.id}`}
                            value="100"
                            checked={field.width === '100'}
                            onChange={(e) => handleGroupFieldChange(index, 'width', e.target.value)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-600">Full Width (100%)</span>
                        </label>
                      </div>
                    </div>

                    <div className="field-options mt-4">
                      <label className="form-checkbox">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => handleGroupFieldChange(index, 'required', e.target.checked)}
                        />
                        <span>Required field</span>
                      </label>
                    </div>

                    {['dropdown', 'singleChoice', 'multipleChoice'].includes(field.type) && (
                      <div className="field-options mt-4">
                        <label className="text-sm font-medium text-gray-700 mb-2">Options</label>
                        <div className="space-y-2">
                          {(field.options || ['']).map((option, optionIndex) => (
                            <div key={optionIndex} className="flex gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => handleGroupFieldOptionChange(index, optionIndex, e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                                className="form-input"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveGroupFieldOption(index, optionIndex)}
                                className="remove-option-btn"
                                disabled={(field.options || []).length <= 1}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <AdminButton
                            type="button"
                            variant="outline"
                            onClick={() => handleAddGroupFieldOption(index)}
                            className="add-option-btn"
                          >
                            Add Option
                          </AdminButton>
                        </div>
                      </div>
                    )}

                    {field.type === 'textarea' && (
                      <div className="form-group mt-4">
                        <label className="form-checkbox">
                          <input
                            type="checkbox"
                            checked={field.enableRewrite || false}
                            onChange={(e) => handleGroupFieldChange(index, 'enableRewrite', e.target.checked)}
                          />
                          <span>Enable AI Rewrite Feature</span>
                          <p className="info-text">
                            Allows users to rewrite their text using AI assistance
                          </p>
                        </label>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveGroupField(index)}
                    className="remove-field-btn"
                    disabled={formData.groupFields.length <= 1}
                  >
                    <FiTrash2 className="text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <AdminButton
            type="button"
            variant="outline"
            onClick={handleAddGroupField}
            className="mt-4"
          >
            <FiPlus /> Add Field
          </AdminButton>
        </div>
      );
    }
    return null;
  };

  const renderTypeSpecificFields = () => {
    switch (questionType) {
      case 'text':
        return (
          <div className="text-options">
            <div className="form-group">
              <label className="form-label">Input Type</label>
              <select
                value={formData.inputType || 'text'}
                onChange={(e) => setFormData({
                  ...formData,
                  inputType: e.target.value,
                  validation: {
                    ...formData.validation,
                    maxLength: e.target.value === 'textarea' ? 500 : 100
                  }
                })}
                className="form-input"
              >
                <option value="text">Single Line Text</option>
                <option value="textarea">Multi-line Text (Textarea)</option>
              </select>
            </div>

            {formData.inputType === 'textarea' && (
              <div className="form-group mt-4">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.enableRewrite || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      enableRewrite: e.target.checked
                    })}
                  />
                  <span>Enable AI Rewrite Feature</span>
                  <p className="info-text">
                    Allows users to rewrite their text using AI assistance
                  </p>
                </label>
              </div>
            )}
          </div>
        );

      case 'multipleChoice':
      case 'dropdown':
        return (
          <div className="options-container">
            <label className="form-label required-field">Options</label>
            {formData.options.map((option, index) => (
              <div key={index} className="option-row">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className={`form-input ${errors.options ? 'error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="remove-option-btn"
                  disabled={formData.options.length <= 1}
                >
                  ×
                </button>
              </div>
            ))}
            {errors.options && (
              <p className="error-message">{errors.options}</p>
            )}
            <AdminButton
              type="button"
              variant="outline"
              onClick={addOption}
              className="add-option-btn"
            >
              Add Option
            </AdminButton>
          </div>
        );
    }
  };

  const renderWidthSelection = () => {
    return (
      <div className="field-width mt-4">
        <label className="text-sm font-medium text-gray-700 mb-2">Field Width</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="field-width"
              value="50"
              checked={formData.width === '50'}
              onChange={(e) => setFormData({ ...formData, width: e.target.value })}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">Half Width (50%)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="field-width"
              value="100"
              checked={formData.width === '100'}
              onChange={(e) => setFormData({ ...formData, width: e.target.value })}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">Full Width (100%)</span>
          </label>
        </div>
      </div>
    );
  };

  const handleGroupFieldOptionChange = (fieldIndex, optionIndex, value) => {
    const newGroupFields = [...formData.groupFields];
    if (!newGroupFields[fieldIndex].options) {
      newGroupFields[fieldIndex].options = [''];
    }
    newGroupFields[fieldIndex].options[optionIndex] = value;
    setFormData({
      ...formData,
      groupFields: newGroupFields
    });
  };

  const handleAddGroupFieldOption = (fieldIndex) => {
    const newGroupFields = [...formData.groupFields];
    if (!newGroupFields[fieldIndex].options) {
      newGroupFields[fieldIndex].options = [''];
    } else {
      newGroupFields[fieldIndex].options.push('');
    }
    setFormData({
      ...formData,
      groupFields: newGroupFields
    });
  };

  const handleRemoveGroupFieldOption = (fieldIndex, optionIndex) => {
    const newGroupFields = [...formData.groupFields];
    if (newGroupFields[fieldIndex].options.length > 1) {
      newGroupFields[fieldIndex].options = newGroupFields[fieldIndex].options.filter(
        (_, i) => i !== optionIndex
      );
      setFormData({
        ...formData,
        groupFields: newGroupFields
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="question-form">
      <div className="form-group">
        <label className="form-label required-field">Question Text</label>
        <input
          type="text"
          value={formData.question}
          onChange={(e) => {
            setFormData({ ...formData, question: e.target.value });
            if (errors.question) setErrors({ ...errors, question: null });
          }}
          placeholder="Enter your question"
          className={`form-input ${errors.question ? 'error' : ''}`}
        />
        {errors.question && (
          <p className="error-message">{errors.question}</p>
        )}
      </div>

      {questionType !== 'repeater' && renderWidthSelection()}

      {renderTypeSpecificFields()}
      {renderValidationFields()}

      <div className="form-group">
        <label className="form-checkbox">
          <input
            type="checkbox"
            checked={formData.required}
            onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
          />
          <span>Required field</span>
        </label>
      </div>

      {renderGroupFields()}

      {errors.submit && (
        <div className="error-message submit-error">
          {errors.submit}
        </div>
      )}

      <div className="form-actions">
        <AdminButton
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </AdminButton>
        <AdminButton
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {initialData ? 'Save Changes' : 'Add Question'}
        </AdminButton>
      </div>

      <input type="hidden" name="profileType" value={profileType} />
      <input type="hidden" name="sectionId" value={sectionId} />
    </form>
  );
};

export default QuestionForm; 