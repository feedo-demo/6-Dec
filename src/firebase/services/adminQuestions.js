/**
 * Admin Questions Service
 * 
 * Features:
 * - Section-based question management
 * - Profile type management
 * - Batch operations for data consistency
 */

import { db } from '../config';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';

export const adminQuestionsService = {
  // Single document reference
  profilesDoc: doc(db, 'admin', 'profiles'),

  async getProfileTypes() {
    try {
      const docSnap = await getDoc(this.profilesDoc);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return Object.entries(data.profileTypes || {}).map(([id, profile]) => ({
          id,
          ...profile
        }));
      }
      return [];
    } catch (error) {
      console.error('Get profile types error:', error);
      throw error;
    }
  },

  async addProfileType(profileTypeData) {
    try {
      const docSnap = await getDoc(this.profilesDoc);
      const currentData = docSnap.exists() ? docSnap.data() : { profileTypes: {} };

      await setDoc(this.profilesDoc, {
        ...currentData,
        profileTypes: {
          ...currentData.profileTypes,
          [profileTypeData.id]: {
            ...profileTypeData,
            icon: profileTypeData.icon,
            metadata: {
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              version: 1
            }
          }
        }
      }, { merge: true });

      return profileTypeData;
    } catch (error) {
      console.error('Add profile type error:', error);
      throw error;
    }
  },

  async deleteProfileType(profileTypeId) {
    try {
      const docSnap = await getDoc(this.profilesDoc);
      if (!docSnap.exists()) return;

      const currentData = docSnap.data();
      const { [profileTypeId]: removed, ...remainingTypes } = currentData.profileTypes;

      await setDoc(this.profilesDoc, {
        ...currentData,
        profileTypes: remainingTypes
      });

      return true;
    } catch (error) {
      console.error('Delete profile type error:', error);
      throw error;
    }
  },

  async getQuestions(profileType, sectionId) {
    try {
      const docSnap = await getDoc(this.profilesDoc);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.profileTypes?.[profileType]?.sections?.[sectionId]?.questions || [];
      }
      return [];
    } catch (error) {
      console.error('Get questions error:', error);
      throw error;
    }
  },

  async addQuestion(profileType, sectionId, questionData) {
    try {
      const docSnap = await getDoc(this.profilesDoc);
      if (!docSnap.exists()) throw new Error('Profile document not found');

      const data = docSnap.data();
      const questions = data.profileTypes?.[profileType]?.sections?.[sectionId]?.questions || [];

      await updateDoc(this.profilesDoc, {
        [`profileTypes.${profileType}.sections.${sectionId}.questions`]: [...questions, questionData],
        [`profileTypes.${profileType}.sections.${sectionId}.updatedAt`]: serverTimestamp(),
        [`profileTypes.${profileType}.metadata.updatedAt`]: serverTimestamp()
      });

      return questionData.id;
    } catch (error) {
      console.error('Add question error:', error);
      throw error;
    }
  },

  async updateQuestion(profileType, sectionId, questionId, questionData) {
    try {
      const docSnap = await getDoc(this.profilesDoc);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const questions = data.profileTypes?.[profileType]?.sections?.[sectionId]?.questions || [];
        
        const questionIndex = questions.findIndex(q => q.id === questionId);
        
        if (questionIndex === -1) {
          throw new Error('Question not found');
        }

        // Clean and validate the data before updating
        const cleanData = {
          id: questionId,
          question: questionData.question || '',
          description: questionData.description || '',
          type: questionData.type || 'text',
          required: Boolean(questionData.required),
          order: questionData.order || 0,
          width: questionData.width || '100',
          updatedAt: new Date().toISOString()
        };

        // Add type-specific data
        if (['singleChoice', 'multipleChoice', 'dropdown'].includes(questionData.type)) {
          cleanData.options = Array.isArray(questionData.options) ? 
            questionData.options.filter(Boolean) : [];
        }

        if (questionData.type === 'text') {
          cleanData.inputType = questionData.inputType || 'text';
          cleanData.enableRewrite = questionData.inputType === 'textarea' ? 
            Boolean(questionData.enableRewrite) : false;
          cleanData.validation = {
            minLength: parseInt(questionData.validation?.minLength) || 0,
            maxLength: parseInt(questionData.validation?.maxLength) || 
              (questionData.inputType === 'textarea' ? 500 : 100),
            pattern: questionData.validation?.pattern || ''
          };
        }

        if (questionData.type === 'repeater') {
          cleanData.repeaterFields = (questionData.repeaterFields || []).map(field => ({
            id: field.id || Date.now().toString(),
            label: field.label || '',
            type: field.type || 'text',
            required: Boolean(field.required),
            width: field.width || '100',
            // Add enableRewrite for textarea fields
            ...(field.type === 'textarea' && {
              enableRewrite: Boolean(field.enableRewrite)
            }),
            // Preserve options for choice-based fields
            ...((['dropdown', 'multipleChoice'].includes(field.type) && field.options) && {
              options: Array.isArray(field.options) ? field.options.filter(Boolean) : []
            }),
            // Add validation for specific field types
            ...(field.validation && {
              validation: {
                fileTypes: field.validation.fileTypes || [],
                minLength: parseInt(field.validation.minLength) || 0,
                maxLength: parseInt(field.validation.maxLength) || 
                  (field.type === 'textarea' ? 500 : 100) // Set different max length for textarea
              }
            })
          }));
          cleanData.validation = {
            minGroups: parseInt(questionData.validation?.minGroups) || 1,
            maxGroups: parseInt(questionData.validation?.maxGroups) || 
              (questionData.allowMultipleGroups ? 10 : 1)
          };
          cleanData.allowMultipleGroups = Boolean(questionData.allowMultipleGroups);
        }

        // Create updated questions array
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex] = cleanData;
        
        // Update Firestore with clean data
        await updateDoc(this.profilesDoc, {
          [`profileTypes.${profileType}.sections.${sectionId}.questions`]: updatedQuestions,
          [`profileTypes.${profileType}.sections.${sectionId}.updatedAt`]: serverTimestamp(),
          [`profileTypes.${profileType}.metadata.updatedAt`]: serverTimestamp()
        });

        return cleanData;
      }
    } catch (error) {
      console.error('Update question error:', error);
      throw error;
    }
  },

  async deleteQuestion(profileType, sectionId, questionId) {
    try {
      const docSnap = await getDoc(this.profilesDoc);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const questions = data.profileTypes?.[profileType]?.sections?.[sectionId]?.questions || [];
        
        const updatedQuestions = questions.filter(q => q.id !== questionId);
        
        await updateDoc(this.profilesDoc, {
          [`profileTypes.${profileType}.sections.${sectionId}.questions`]: updatedQuestions,
          [`profileTypes.${profileType}.sections.${sectionId}.updatedAt`]: serverTimestamp(),
          [`profileTypes.${profileType}.metadata.updatedAt`]: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Delete question error:', error);
      throw error;
    }
  },

  async reorderQuestions(profileType, sectionId, questions) {
    try {
      const docSnap = await getDoc(this.profilesDoc);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const currentQuestions = data.profileTypes?.[profileType]?.sections?.[sectionId]?.questions || [];
        
        const updatedQuestions = questions.map((q, index) => ({
          ...q,
          order: index
        }));
        
        await updateDoc(this.profilesDoc, {
          [`profileTypes.${profileType}.sections.${sectionId}.questions`]: updatedQuestions,
          [`profileTypes.${profileType}.sections.${sectionId}.updatedAt`]: serverTimestamp(),
          [`profileTypes.${profileType}.metadata.updatedAt`]: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Reorder questions error:', error);
      throw error;
    }
  },

  async updateProfileType(profileTypeData) {
    try {
      const docSnap = await getDoc(this.profilesDoc);
      if (!docSnap.exists()) throw new Error('Profile document not found');

      const currentData = docSnap.data();
      const existingProfileType = currentData.profileTypes?.[profileTypeData.id];
      
      // Generate new ID if label changed
      const newId = generateId(profileTypeData.label);
      const idChanged = newId !== profileTypeData.id;

      // Initialize userSnapshots as null
      let userSnapshots = null;

      // First, merge the sections properly
      const mergedSections = {};
      
      // Check for section mappings in the incoming data
      const sectionMappings = profileTypeData._sectionMappings || {};
      delete profileTypeData._sectionMappings; // Remove from final data

      // Create maps for section data
      const oldSections = new Map();
      const newSections = new Map();

      // Populate old sections map
      if (existingProfileType?.sections) {
        Object.entries(existingProfileType.sections).forEach(([id, section]) => {
          oldSections.set(id, section);
        });
      }

      // Populate new sections map
      Object.entries(profileTypeData.sections).forEach(([id, section]) => {
        newSections.set(id, section);
      });

      // First handle explicit mappings
      Object.entries(sectionMappings).forEach(([oldId, newId]) => {
        if (oldSections.has(oldId) && newSections.has(newId)) {
          const oldSection = oldSections.get(oldId);
          const newSection = newSections.get(newId);
          
          mergedSections[newId] = {
            ...newSection,
            questions: oldSection.questions || [], // Preserve questions from old section
            updatedAt: serverTimestamp()
          };

          // Remove from both maps to indicate they've been handled
          oldSections.delete(oldId);
          newSections.delete(newId);
        }
      });

      // Handle unchanged sections (preserve their questions)
      newSections.forEach((newSection, newId) => {
        if (oldSections.has(newId)) {
          // This is an unchanged section - preserve its questions
          const oldSection = oldSections.get(newId);
          mergedSections[newId] = {
            ...newSection,
            questions: oldSection.questions || [], // Preserve existing questions
            updatedAt: serverTimestamp()
          };
          oldSections.delete(newId);
          newSections.delete(newId);
        }
      });

      // Add remaining new sections
      newSections.forEach((section, id) => {
        mergedSections[id] = {
          ...section,
          questions: [],
          updatedAt: serverTimestamp()
        };
      });

      // Create the updated profile type
      const updatedProfileType = {
        ...existingProfileType,
        ...profileTypeData,
        id: newId,
        sections: mergedSections,
        metadata: {
          ...existingProfileType?.metadata,
          updatedAt: serverTimestamp()
        }
      };

      // If ID changed, we need to update all users with this profile type
      if (idChanged) {
        // Get all users with the old profile type ID
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('profile.userType', '==', profileTypeData.id));
        userSnapshots = await getDocs(q);

        // Batch write for better performance
        const batch = writeBatch(db);

        // Update each user's profile type
        userSnapshots.forEach((userDoc) => {
          const userRef = doc(db, 'users', userDoc.id);
          batch.update(userRef, {
            'profile.userType': newId,
            'profile.userTypeLabel': profileTypeData.label
          });
        });

        // Update the profile types document
        const updatedProfileTypes = {
          ...currentData.profileTypes,
          [newId]: updatedProfileType
        };
        delete updatedProfileTypes[profileTypeData.id];
        
        batch.set(this.profilesDoc, {
          ...currentData,
          profileTypes: updatedProfileTypes
        });

        // Commit all updates
        await batch.commit();
      } else {
        // Just update the profile type if ID hasn't changed
        await updateDoc(this.profilesDoc, {
          [`profileTypes.${profileTypeData.id}`]: updatedProfileType
        });
      }

      return {
        success: true,
        changes: {
          before: {
            id: profileTypeData.id,
            sections: existingProfileType?.sections || {},
            totalSections: Object.keys(existingProfileType?.sections || {}).length,
            questionsCount: Object.values(existingProfileType?.sections || {})
              .reduce((total, section) => total + (section.questions?.length || 0), 0)
          },
          after: {
            id: newId,
            sections: mergedSections,
            totalSections: Object.keys(mergedSections).length,
            questionsCount: Object.values(mergedSections)
              .reduce((total, section) => total + (section.questions?.length || 0), 0)
          },
          idChanged,
          oldId: idChanged ? profileTypeData.id : null,
          newId: idChanged ? newId : null,
          mappings: sectionMappings,
          unmappedOldSections: Array.from(oldSections.keys()),
          newSections: Array.from(newSections.keys()),
          usersUpdated: userSnapshots?.size || 0
        }
      };

    } catch (error) {
      console.error('Error updating profile type:', error);
      throw error;
    }
  }
}; 

// Helper function to calculate string similarity (Levenshtein distance based)
function stringSimilarity(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const maxLen = Math.max(len1, len2);
  return (maxLen - matrix[len1][len2]) / maxLen;
} 

// Helper function to generate ID from label
function generateId(label) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
} 