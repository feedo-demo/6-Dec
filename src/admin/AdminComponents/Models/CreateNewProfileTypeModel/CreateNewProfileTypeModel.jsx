/**
 * SectionModal Component
 * 
 * Features:
 * - Add/Edit profile types and sections
 * - Auto-generated IDs from labels
 * - Organized section management per profile type
 */

import React, { useState, useEffect } from 'react';
import AdminButton from '../../AdminButton/AdminButton';
import { FiX, FiPlus, FiUser, FiList, FiAlertCircle, FiTrash2, FiSearch } from 'react-icons/fi';
import './CreateNewProfileTypeModel.css';
import { PROFILE_ICONS } from '../../../Icons/profileIcons';

const SectionModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  const [formData, setFormData] = useState({
    label: '',
    subtitle: '',
    icon: '',
    sections: [{ label: '' }]
  });

  const [sectionMappings, setSectionMappings] = useState(new Map());
  const [iconSearch, setIconSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Convert sections object to array if needed
        const sectionsArray = initialData.sections 
          ? Object.entries(initialData.sections).map(([id, section]) => ({
              id,
              label: section.label,
              originalId: id // Keep track of original ID
            }))
          : [{ label: '' }];

        setFormData({
          label: initialData.label,
          subtitle: initialData.subtitle || '',
          icon: initialData.icon || '',
          sections: sectionsArray
        });

        // Initialize mappings for existing sections
        const initialMappings = new Map();
        sectionsArray.forEach(section => {
          if (section.originalId) {
            initialMappings.set(section.originalId, section.originalId);
          }
        });
        setSectionMappings(initialMappings);
      } else {
        setFormData({
          label: '',
          subtitle: '',
          icon: '',
          sections: [{ label: '' }]
        });
        setSectionMappings(new Map());
      }
    }
  }, [isOpen, initialData]);

  // Function to generate ID from label
  const generateId = (label) => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.label.trim()) {
      newErrors.label = 'Profile type label is required';
    }

    // Validate sections
    const sectionErrors = [];
    const sectionLabels = new Set();
    
    formData.sections.forEach((section, index) => {
      const sectionError = {};
      
      if (!section.label.trim()) {
        sectionError.label = 'Section label is required';
      } else if (sectionLabels.has(section.label.toLowerCase())) {
        sectionError.label = 'Section labels must be unique';
      }
      
      if (Object.keys(sectionError).length > 0) {
        sectionErrors[index] = sectionError;
      }
      
      sectionLabels.add(section.label.toLowerCase());
    });
    
    if (sectionErrors.length > 0) {
      newErrors.sections = sectionErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const profileTypeId = initialData?.id || generateId(formData.label);
      
      // Convert sections array to object with proper mappings
      const sectionsObject = {};
      formData.sections.forEach(section => {
        const sectionId = section.id || generateId(section.label);
        sectionsObject[sectionId] = {
          id: sectionId,
          label: section.label,
          questions: [],
          updatedAt: new Date().toISOString()
        };
      });

      // Create the section mappings object
      const mappingsObject = {};
      sectionMappings.forEach((newId, oldId) => {
        if (oldId !== newId) { // Only include changed mappings
          mappingsObject[oldId] = newId;
        }
      });

      const profileTypeData = {
        id: profileTypeId,
        label: formData.label,
        subtitle: formData.subtitle,
        icon: formData.icon,
        sections: sectionsObject,
        _sectionMappings: mappingsObject, // Add mappings to the data
        metadata: {
          createdAt: initialData?.metadata?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: initialData?.metadata?.version || 1
        }
      };

      console.log('Submitting profile type:', profileTypeData);
      onSave(profileTypeData);
    }
  };

  const handleAddSection = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, { label: '' }]
    });
  };

  const handleRemoveSection = (index) => {
    setFormData({
      ...formData,
      sections: formData.sections.filter((_, i) => i !== index)
    });
  };

  const handleSectionChange = (index, value) => {
    const newSections = [...formData.sections];
    const section = newSections[index];
    const oldId = section.id || generateId(section.label);
    const newId = generateId(value);
    
    newSections[index] = { 
      ...section,
      label: value,
      id: newId
    };

    // Update mappings if this was an existing section
    if (section.originalId) {
      setSectionMappings(prevMappings => {
        const newMappings = new Map(prevMappings);
        newMappings.set(section.originalId, newId);
        return newMappings;
      });
    }

    setFormData({ ...formData, sections: newSections });
    
    // Clear errors for the changed field
    if (errors.sections?.[index]?.label) {
      const newErrors = { ...errors };
      if (newErrors.sections) {
        delete newErrors.sections[index];
        if (Object.keys(newErrors.sections).length === 0) {
          delete newErrors.sections;
        }
      }
      setErrors(newErrors);
    }
  };

  const handleIconSelect = (iconId) => {
    setFormData({ ...formData, icon: iconId });
  };

  const filteredIcons = iconSearch.trim() 
    ? PROFILE_ICONS.filter(icon => 
        icon.label.toLowerCase().includes(iconSearch.toLowerCase())
      )
    : [];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="section-modal">
        <div className="modal-header">
          <h2>{initialData ? 'Edit Profile Type' : 'Create New Profile Type'}</h2>
          <button className="close-button" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="section-modal-form">
          <div className="form-section">
            <div className="form-group">
              <label>Profile Type Name</label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => {
                  setFormData({ ...formData, label: e.target.value });
                  if (errors.label) {
                    setErrors({ ...errors, label: null });
                  }
                }}
                placeholder="e.g., Student, Entrepreneur, Company"
                className={errors.label ? 'error' : ''}
              />
              {errors.label && (
                <span className="error-message">
                  <FiAlertCircle />
                  {errors.label}
                </span>
              )}
              <p className="helper-text">
                Choose a name that identifies this type of profile (e.g., Student Profile, Company Profile).
              </p>
            </div>

            <div className="form-group">
              <label>Profile Type Subtitle <span className="optional-text">(Optional)</span></label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g., Create a profile for students and graduates"
                className="form-input"
              />
              <p className="helper-text">
                Add a brief description to explain the purpose of this profile type.
              </p>
            </div>

            <div className="form-group mt-4">
              <label>Profile Type Icon</label>
              <div className="icon-search-container">
                <div className="search-input-wrapper">
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search icons (e.g., user, business, education)..."
                    value={iconSearch}
                    onChange={(e) => {
                      setIconSearch(e.target.value);
                      setIsSearching(true);
                    }}
                    className="icon-search-input"
                  />
                  {iconSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setIconSearch('');
                        setIsSearching(false);
                      }}
                      className="clear-search"
                    >
                      <FiX />
                    </button>
                  )}
                </div>
                
                {!isSearching && formData.icon && (
                  <div className="selected-icon-display">
                    {(() => {
                      const IconComponent = PROFILE_ICONS.find(i => i.id === formData.icon)?.icon;
                      return IconComponent && (
                        <>
                          <IconComponent className="current-icon" />
                          <span className="icon-label">
                            {PROFILE_ICONS.find(i => i.id === formData.icon)?.label}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                )}

                {isSearching && (
                  <div className="icon-search-results">
                    {filteredIcons.length > 0 ? (
                      <div className="icon-grid">
                        {filteredIcons.map((iconOption) => {
                          const IconComponent = iconOption.icon;
                          return (
                            <button
                              key={iconOption.id}
                              type="button"
                              className={`icon-option ${formData.icon === iconOption.id ? 'selected' : ''}`}
                              onClick={() => {
                                handleIconSelect(iconOption.id);
                                setIconSearch('');
                                setIsSearching(false);
                              }}
                              title={iconOption.label}
                            >
                              <IconComponent className="icon" />
                              <span className="icon-label">{iconOption.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="no-results">
                        No icons found matching "{iconSearch}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>
                <FiList className="text-xl" />
                Profile Sections
                <span className="section-counter">
                  ({formData.sections.length} {formData.sections.length === 1 ? 'section' : 'sections'})
                </span>
              </h3>
              <AdminButton
                type="button"
                variant="outline"
                onClick={handleAddSection}
                className="add-section-button"
              >
                <FiPlus /> Add Profile Section
              </AdminButton>
            </div>

            <p className="helper-text mb-4">
              Divide your profile into sections to organize related information (e.g., Personal Details, Education History, Work Experience).
            </p>

            <div className="sections-list">
              {formData.sections.map((section, index) => (
                <div key={index} className="section-item">
                  <div className="section-inputs">
                    <div className="form-group">
                      <label>Profile Section Name</label>
                      <input
                        type="text"
                        value={section.label}
                        onChange={(e) => handleSectionChange(index, e.target.value)}
                        placeholder="e.g., Personal Information, Education History, Work Experience"
                        className={errors.sections?.[index]?.label ? 'error' : ''}
                      />
                      {errors.sections?.[index]?.label && (
                        <span className="error-message">
                          <FiAlertCircle />
                          {errors.sections[index].label}
                        </span>
                      )}
                    </div>
                  </div>

                  {formData.sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(index)}
                      className="remove-section-button"
                      title="Remove profile section"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <AdminButton
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </AdminButton>
            <AdminButton
              type="submit"
              variant="primary"
            >
              {initialData ? 'Save Profile Type' : 'Create Profile Type'}
            </AdminButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SectionModal; 