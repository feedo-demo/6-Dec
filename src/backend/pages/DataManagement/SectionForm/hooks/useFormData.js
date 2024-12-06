import { useState, useEffect } from 'react';
import { useAuth } from '../../../../../auth/AuthContext';
import { eventEmitter, EVENTS } from '../../../../../services/eventEmitter';
import { useToast } from '../../../../../components/Toast/ToastContext';
import { storage, auth } from '../../../../../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { generateProfessionalSummary } from '../../../../../services/openai';
import { updateEmail, verifyBeforeUpdateEmail, onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../../firebase/config';

export const useFormData = (section, profileType, initialFormData) => {
  const { user, updateProfile, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState(initialFormData || {});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [enhancingFields, setEnhancingFields] = useState({});
  const [filePreviews, setFilePreviews] = useState({});
  const [lastEnhancedField, setLastEnhancedField] = useState(null);

  // Add auth state change listener for email updates
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser && user?.profile?.authUid) {
        // Check if email has changed
        if (authUser.email !== user.profile.email) {
          try {
            // Update email in Firestore
            const userRef = doc(db, 'users', user.profile.authUid);
            await updateDoc(userRef, {
              'profile.email': authUser.email,
              'email': authUser.email
            });

            // Update profile in context
            await updateProfile({
              profile: {
                ...user.profile,
                email: authUser.email
              }
            });

            // Refresh user data
            await refreshUser();

            showToast('Email updated successfully!', 'success');
          } catch (error) {
            console.error('Error updating email in profile:', error);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [user?.profile?.authUid]);

  // Monitor form data changes
  useEffect(() => {
    if (lastEnhancedField) {
      const { questionId, groupIndex, fieldId, enhancedText } = lastEnhancedField;
      
      // Verify the update was successful
      let currentValue;
      if (groupIndex !== undefined && fieldId !== undefined) {
        currentValue = formData[questionId]?.[groupIndex]?.[fieldId];
      } else {
        currentValue = formData[questionId];
      }

      console.log('Form data update verification:', {
        expected: enhancedText,
        actual: currentValue,
        match: currentValue === enhancedText
      });

      // Clear the last enhanced field
      setLastEnhancedField(null);
    }
  }, [formData, lastEnhancedField]);

  // Function to upload file to Firebase Storage
  const uploadFile = async (file, path) => {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  // Update formData when initialFormData changes
  useEffect(() => {
    if (initialFormData && Object.keys(initialFormData).length > 0 && !formData.hasBeenInitialized) {
      console.log('Setting form data from initialFormData:', initialFormData);
      setFormData({
        ...initialFormData,
        hasBeenInitialized: true
      });
    }
  }, [initialFormData, formData.hasBeenInitialized]);

  // Load existing data for this section
  useEffect(() => {
    if (!user || !section?.questions) return;
    
    // Skip initialization if we already have form data
    if (Object.keys(formData).length > 0) return;
    
    try {
      setLoading(true);
      console.log('Loading data for section:', section.id);
      console.log('User data:', user);
      console.log('Initial form data:', initialFormData);
      
      // Initialize empty data structure
      const initialData = {};
      
      // Initialize all questions with default values first
      section.questions.forEach(question => {
        if (!question || !question.id) {
          console.log('Invalid question found:', question);
          return;
        }

        try {
          if (question.type === 'repeater') {
            // Ensure repeater fields are always initialized as arrays
            const existingData = initialFormData?.[question.id];
            if (Array.isArray(existingData) && existingData.length > 0) {
              // Ensure each group has all required fields
              initialData[question.id] = existingData.map(group => ({
                ...Object.fromEntries(
                  (question.repeaterFields || []).map(field => {
                    if (['singleChoice', 'multipleChoice', 'dropdown'].includes(field.type)) {
                      return [field.id, field.type === 'multipleChoice' ? [] : ''];
                    }
                    return [field.id, field.type === 'file' ? null : ''];
                  })
                ),
                ...group // Merge with existing data
              }));
            } else {
              initialData[question.id] = [{
                ...Object.fromEntries(
                  (question.repeaterFields || []).map(field => {
                    if (['singleChoice', 'multipleChoice', 'dropdown'].includes(field.type)) {
                      return [field.id, field.type === 'multipleChoice' ? [] : ''];
                    }
                    return [field.id, field.type === 'file' ? null : ''];
                  })
                )
              }];
            }
          } else if (question.type === 'multipleChoice') {
            initialData[question.id] = Array.isArray(initialFormData?.[question.id]) ? initialFormData[question.id] : [];
          } else if (question.type === 'file') {
            initialData[question.id] = initialFormData?.[question.id] || null;
          } else {
            initialData[question.id] = initialFormData?.[question.id] || '';
          }
        } catch (error) {
          console.error('Error initializing question:', question.id, error);
          // Initialize with a safe default value based on question type
          initialData[question.id] = question.type === 'multipleChoice' ? [] : '';
        }
      });

      // No need to merge with initialFormData again since we've already used it above
      console.log('Final merged form data:', initialData);
      setFormData(initialData);
    } catch (error) {
      console.error('Error loading form data:', error);
      setErrors({ submit: 'Error loading form data' });
    } finally {
      setLoading(false);
    }
  }, [user, section?.id, section?.questions, formData]);

  // Helper function to clean undefined values
  const cleanUndefinedValues = (obj) => {
    const cleaned = {};
    
    for (const key in obj) {
      if (obj[key] === undefined) {
        continue; // Skip undefined values
      }
      
      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        cleaned[key] = cleanUndefinedValues(obj[key]); // Recursively clean nested objects
      } else {
        cleaned[key] = obj[key]; // Keep non-undefined values
      }
    }
    
    return cleaned;
  };

  // Handle input changes
  const handleInputChange = (questionId, value) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Handle multi-select changes
  const handleMultiSelectChange = (questionId, event) => {
    const {
      target: { value },
    } = event;
    
    // On autofill we get a stringified value.
    const selectedValues = typeof value === 'string' ? value.split(',') : value;
    
    setFormData(prev => ({
      ...prev,
      [questionId]: selectedValues
    }));
  };

  // Handle repeater group changes
  const handleGroupFieldChange = (questionId, groupIndex, fieldId, value) => {
    setFormData(prev => {
      const currentGroups = Array.isArray(prev[questionId]) ? [...prev[questionId]] : [];
      if (!currentGroups[groupIndex]) {
        currentGroups[groupIndex] = {};
      }
      
      currentGroups[groupIndex] = {
        ...currentGroups[groupIndex],
        [fieldId]: value
      };
      
      return {
        ...prev,
        [questionId]: currentGroups
      };
    });
  };

  // Handle adding repeater groups
  const handleAddGroup = (questionId, fields) => {
    setFormData(prev => {
      const currentGroups = Array.isArray(prev[questionId]) ? prev[questionId] : [];
      const newGroup = {};
      
      fields.forEach(field => {
        if (['singleChoice', 'multipleChoice', 'dropdown'].includes(field.type)) {
          newGroup[field.id] = field.type === 'multipleChoice' ? [] : '';
        } else {
          newGroup[field.id] = '';
        }
      });

      return {
        ...prev,
        [questionId]: [...currentGroups, newGroup]
      };
    });
  };

  // Handle removing repeater groups
  const handleRemoveGroup = (questionId, groupIndex) => {
    setFormData(prev => {
      const currentGroups = Array.isArray(prev[questionId]) ? prev[questionId] : [];
      return {
        ...prev,
        [questionId]: currentGroups.filter((_, index) => index !== groupIndex)
      };
    });
  };

  // Update user data in Firestore
  const updateUserData = async (sectionId, newData) => {
    try {
      if (!user?.profile?.authUid) return;

      // Clean undefined values from the new data
      const cleanedData = cleanUndefinedValues(newData);

      // Handle email change for non-Google users
      if (cleanedData.email && user?.profile?.provider !== 'google.com' && cleanedData.email !== user.profile.email) {
        try {
          // Send verification email to new address
          await verifyBeforeUpdateEmail(auth.currentUser, cleanedData.email);
          
          showToast('A verification email has been sent to your new email address. Please verify it before the change takes effect.', 'info');
          
          // Don't update the profile email yet - it will be updated after verification
          return;
        } catch (error) {
          if (error.code === 'auth/requires-recent-login') {
            throw new Error('Please log in again before changing your email address');
          }
          throw error;
        }
      }

      // Create the section data object
      const sectionData = {
        id: section.id,
        label: section.label,
        profileType,
        questions: section.questions.map(question => ({
          id: question.id,
          type: question.type,
          question: question.question,
          required: question.required,
          answer: cleanedData[question.id] || null
        }))
      };

      // Update profile with the section data
      await updateProfile({
        profileSections: {
          [sectionId]: sectionData
        }
      });

      // Emit section update event
      eventEmitter.emit(EVENTS.SECTION_DATA_UPDATED);
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);
      console.log('=== Form Submission ===');
      console.log('Current user:', user);
      console.log('Section:', section);
      console.log('Form data before processing:', formData);

      // Process all file uploads first
      const processedData = { ...formData };
      const fileUploads = [];

      // Process standalone file questions
      for (const question of section.questions || []) {
        if (question.type === 'file') {
          console.log('Processing file question:', question.id);
          const file = formData[question.id];
          
          // If it's a new file (File object), upload it
          if (file instanceof File) {
            console.log('New file detected, uploading:', file.name);
            const uploadPath = `users/${user.profile.authUid}/${section.id}/${Date.now()}-${file.name}`;
            fileUploads.push(
              uploadFile(file, uploadPath).then(url => {
                console.log('File uploaded successfully:', url);
                processedData[question.id] = {
                  url: url,
                  name: file.name,
                  type: file.type
                };
              })
            );
          }
        }

        // Process repeater fields with file uploads
        if (question.type === 'repeater' && Array.isArray(formData[question.id])) {
          const repeaterData = formData[question.id];
          for (let groupIndex = 0; groupIndex < repeaterData.length; groupIndex++) {
            const group = repeaterData[groupIndex];
            for (const field of question.repeaterFields || []) {
              if (field.type === 'file' && group[field.id] instanceof File) {
                const file = group[field.id];
                const uploadPath = `users/${user.profile.authUid}/${section.id}/${question.id}/${groupIndex}/${Date.now()}-${file.name}`;
                fileUploads.push(
                  uploadFile(file, uploadPath).then(url => {
                    processedData[question.id][groupIndex][field.id] = {
                      url: url,
                      name: file.name,
                      type: file.type
                    };
                  })
                );
              }
            }
          }
        }
      }

      // Wait for all file uploads to complete
      if (fileUploads.length > 0) {
        console.log('Waiting for file uploads to complete...');
        await Promise.all(fileUploads);
        console.log('All file uploads completed');
      }

      // Update user data with processed form data
      await updateUserData(section.id, processedData);
      showToast('Changes saved successfully!', 'success');
      
      // Emit section update event
      eventEmitter.emit(EVENTS.SECTION_DATA_UPDATED);
    } catch (error) {
      console.error('Error updating user data:', error);
      showToast('Failed to save changes. Please try again.', 'error');
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to save changes. Please try again.'
      }));
    } finally {
      setLoading(false);
    }
  };

  // Handle file changes
  const handleFileChange = (questionId, file) => {
    console.log('Handling file change:', { questionId, file });
    
    // If file is null, clear the field
    if (!file) {
      setFormData(prev => ({
        ...prev,
        [questionId]: null
      }));
      setFilePreviews(prev => ({
        ...prev,
        [questionId]: null
      }));
      return;
    }

    // Create a preview URL for the file
    const previewUrl = URL.createObjectURL(file);
    
    setFormData(prev => ({
      ...prev,
      [questionId]: file
    }));
    
    setFilePreviews(prev => ({
      ...prev,
      [questionId]: previewUrl
    }));
  };

  // Cleanup file previews on unmount
  useEffect(() => {
    return () => {
      // Revoke all object URLs to avoid memory leaks
      Object.values(filePreviews).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [filePreviews]);

  // Handle rewrite requests
  const handleRewrite = async (questionId, groupIndex, fieldId) => {
    try {
      // Set loading state for specific field
      setEnhancingFields(prev => ({
        ...prev,
        [questionId]: true
      }));
      
      // Get the current text to rewrite
      let currentText;
      if (groupIndex !== undefined && fieldId !== undefined) {
        // Handle repeater field rewrite
        currentText = formData[questionId]?.[groupIndex]?.[fieldId];
      } else {
        // Handle regular field rewrite
        currentText = formData[questionId];
      }

      if (!currentText) {
        showToast('Please enter some text to rewrite', 'error');
        return;
      }

      // Get the question configuration to determine max length
      const question = section.questions.find(q => q.id === questionId);
      const maxLength = question?.validation?.maxLength || 500;

      // Call OpenAI to enhance the text
      const enhancedText = await generateProfessionalSummary(currentText, maxLength, user?.profile?.authUid);

      console.log('Received enhanced text:', enhancedText);

      // Update the form data with the enhanced text
      if (groupIndex !== undefined && fieldId !== undefined) {
        // Update repeater field
        const updatedGroups = [...(formData[questionId] || [])];
        if (!updatedGroups[groupIndex]) {
          updatedGroups[groupIndex] = {};
        }
        updatedGroups[groupIndex] = {
          ...updatedGroups[groupIndex],
          [fieldId]: enhancedText
        };
        
        const newFormData = {
          ...formData,
          [questionId]: updatedGroups,
          hasBeenInitialized: true
        };
        
        console.log('Updating form data (repeater):', newFormData);
        setFormData(newFormData);
      } else {
        // Update regular field
        const newFormData = {
          ...formData,
          [questionId]: enhancedText,
          hasBeenInitialized: true
        };
        
        console.log('Updating form data (regular):', newFormData);
        setFormData(newFormData);
      }

      // Update user data in Firestore
      await updateUserData(section.id, formData);

      // Emit events to refresh data submission section and token usage stats
      eventEmitter.emit(EVENTS.SECTION_DATA_UPDATED);
      eventEmitter.emit(EVENTS.TOKEN_USAGE_UPDATED);

      showToast('Text enhanced successfully!', 'success');
    } catch (error) {
      console.error('Error in handleRewrite:', error);
      showToast(error.message || 'Failed to enhance text. Please try again.', 'error');
    } finally {
      // Clear loading state for specific field
      setEnhancingFields(prev => ({
        ...prev,
        [questionId]: false
      }));
    }
  };

  return {
    formData,
    errors,
    loading,
    enhancingFields,
    handleInputChange,
    handleMultiSelectChange,
    handleGroupFieldChange,
    handleAddGroup,
    handleRemoveGroup,
    handleSubmit,
    handleFileChange,
    filePreviews,
    handleRewrite,
    setErrors
  };
}; 