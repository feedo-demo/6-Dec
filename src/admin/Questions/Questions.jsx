/**
 * Questions Management Component
 * 
 * Features:
 * - Profile type management
 * - Section configuration
 * - Question management per section
 */

import React, { useState, useEffect } from 'react';
import './Questions.css';
import CreateNewProfileTypeModel from '../AdminComponents/Models/CreateNewProfileTypeModel/CreateNewProfileTypeModel';
import ConfirmationModal from '../AdminComponents/Models/ConfirmationModal/ConfirmationModal';
import { adminQuestionsService } from '../../firebase/services/adminQuestions';
import { useToast } from '../../components/Toast/ToastContext';
import AdminButton from '../AdminComponents/AdminButton/AdminButton';
import QuestionTypeRouter from '../QuestionTypeRouter/QuestionTypeRouter';
import { FiPlus, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import { PROFILE_ICONS } from '../Icons/profileIcons';

const Questions = () => {
  const [profileTypes, setProfileTypes] = useState([]);
  const [selectedProfileType, setSelectedProfileType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfileType, setEditingProfileType] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    profileType: null
  });
  const { showToast } = useToast();

  useEffect(() => {
    loadProfileTypes();
  }, []);

  const loadProfileTypes = async () => {
    try {
      const types = await adminQuestionsService.getProfileTypes();
      console.log('Loaded profile types:', types);
      setProfileTypes(types);
    } catch (error) {
      console.error('Error loading profile types:', error);
      showToast('error', 'Failed to load profile types');
    }
  };

  const handleAddProfileType = async (profileTypeData) => {
    try {
      console.log('Adding profile type:', profileTypeData);
      await adminQuestionsService.addProfileType(profileTypeData);
      showToast('success', 'Profile type added successfully');
      await loadProfileTypes();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding profile type:', error);
      showToast('error', 'Failed to add profile type');
    }
  };

  const handleEditProfileType = async (profileTypeData) => {
    try {
      const result = await adminQuestionsService.updateProfileType(profileTypeData);
      
      if (result.changes.idChanged && selectedProfileType === result.changes.oldId) {
        setSelectedProfileType(result.changes.newId);
      }
      
      const message = `Profile type updated: 
        ${result.changes.newSections.length} new sections, 
        ${Object.keys(result.changes.mappings).length} sections mapped. 
        Questions preserved: ${result.changes.after.questionsCount}`;
      
      showToast('success', message);
      await loadProfileTypes();
      setIsModalOpen(false);
      setEditingProfileType(null);
      
      console.log('Profile type update details:', result.changes);
      
    } catch (error) {
      console.error('Error updating profile type:', error);
      showToast('error', 'Failed to update profile type');
    }
  };

  const handleDeleteClick = (profileType) => {
    setDeleteConfirmation({
      isOpen: true,
      profileType: profileType
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await adminQuestionsService.deleteProfileType(deleteConfirmation.profileType.id);
      showToast('success', 'Profile type deleted successfully');
      if (selectedProfileType === deleteConfirmation.profileType.id) {
        setSelectedProfileType('');
      }
      await loadProfileTypes();
    } catch (error) {
      console.error('Error deleting profile type:', error);
      showToast('error', 'Failed to delete profile type');
    } finally {
      setDeleteConfirmation({ isOpen: false, profileType: null });
    }
  };

  const getSelectedProfileSections = () => {
    const selectedProfile = profileTypes.find(t => t.id === selectedProfileType);
    if (!selectedProfile?.sections) return [];
    
    return Object.entries(selectedProfile.sections).map(([id, section]) => ({
      id,
      ...section
    }));
  };

  return (
    <div className="questions-container">
      <div className="page-header">
        <h1>Profile Questions Management</h1>
        <AdminButton
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="add-profile-button"
        >
          <FiPlus /> Add Profile Type
        </AdminButton>
      </div>

      {profileTypes.length === 0 ? (
        <div className="empty-profile-types">
          <div className="empty-content">
            <div className="empty-icon">📝</div>
            <h2>No Profile Types Added</h2>
            <p>Get started by adding your first profile type.</p>
            <p className="empty-details">
              Profile types help organize different sets of questions for various user categories.
            </p>
            <AdminButton
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              className="mt-6"
            >
              <FiPlus /> Add Profile Type
            </AdminButton>
          </div>
        </div>
      ) : (
        <>
          <div className="profile-type-selector">
            <h2>Select Profile Type</h2>
            <div className="profile-type-buttons">
              {profileTypes.map(type => (
                <div key={type.id} className="profile-type-wrapper">
                  <AdminButton
                    variant="outline"
                    className={`profile-type-btn ${selectedProfileType === type.id ? 'active' : ''}`}
                    onClick={() => setSelectedProfileType(type.id)}
                  >
                    {(() => {
                      const IconComponent = PROFILE_ICONS.find(icon => icon.id === type.icon)?.icon || FiUser;
                      return (
                        <>
                          <IconComponent className="profile-type-icon" />
                          {type.label}
                        </>
                      );
                    })()}
                  </AdminButton>
                  <div className="profile-type-actions">
                    <FiEdit2 
                      className="action-icon edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProfileType(type);
                        setIsModalOpen(true);
                      }}
                      title="Edit profile type"
                    />
                    <FiTrash2 
                      className="action-icon delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(type);
                      }}
                      title="Delete profile type"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedProfileType && (
            <div className="questions-content">
              <QuestionTypeRouter
                profileType={selectedProfileType}
                sections={getSelectedProfileSections()}
              />
            </div>
          )}
        </>
      )}

      <CreateNewProfileTypeModel
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProfileType(null);
        }}
        onSave={editingProfileType ? handleEditProfileType : handleAddProfileType}
        initialData={editingProfileType}
      />

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, profileType: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Profile Type"
        message={
          deleteConfirmation.profileType
            ? `Are you sure you want to delete "${deleteConfirmation.profileType.label}"? This will delete all sections and questions within this profile type.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Questions; 