import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useProfileProgress = () => {
  const { user, loading: authLoading } = useAuth();
  const [sections, setSections] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [submissionItems, setSubmissionItems] = useState([]);

  // Helper function to check section completion
  const checkSectionCompletion = (sectionId, questions, profileSections) => {
    console.log('=== Section Completion Check ===');
    console.log('Checking section:', sectionId);
    console.log('Profile sections:', profileSections);
    console.log('Questions:', questions);

    if (!questions || !profileSections) {
      console.log('Missing questions or profileSections data');
      return false;
    }

    const sectionData = profileSections[sectionId];
    console.log('Section data:', sectionData);

    if (!sectionData || !sectionData.questions) {
      console.log('No section data or questions found');
      return false;
    }

    // Get required questions
    const requiredQuestions = questions.filter(q => q.required);
    console.log('Required questions:', requiredQuestions);

    // If there are no required questions, we'll check all questions
    const questionsToCheck = requiredQuestions.length > 0 ? requiredQuestions : questions;
    console.log('Questions to check:', questionsToCheck);

    for (const question of questionsToCheck) {
      console.log('\nChecking question:', question.id);
      console.log('Question type:', question.type);
      console.log('Required:', question.required);

      const questionData = sectionData.questions.find(q => q.id === question.id);
      console.log('Question data:', questionData);

      if (!questionData || questionData.answer === undefined || questionData.answer === null) {
        console.log('Question data missing or answer undefined');
        return false;
      }

      // Check for empty values based on question type
      switch (question.type) {
        case 'file':
          console.log('File type question check:');
          console.log('Answer:', questionData.answer);
          const fileValue = questionData.answer;
          if (!fileValue) {
            console.log('File missing');
            return false;
          }
          
          if (typeof fileValue === 'object' && !fileValue.url) {
            console.log('File object missing URL');
            return false;
          }
          
          if (typeof fileValue === 'string' && !fileValue.trim()) {
            console.log('File URL is empty');
            return false;
          }
          break;

        case 'repeater':
          console.log('Repeater type question check:');
          console.log('Answer:', questionData.answer);
          if (!Array.isArray(questionData.answer) || questionData.answer.length === 0) {
            console.log('Repeater answer missing or invalid');
            return false;
          }
          // Check each repeater field
          for (const entry of questionData.answer) {
            for (const field of question.repeaterFields || []) {
              if (field.required && (!entry[field.id] || entry[field.id] === '')) {
                console.log(`Required repeater field ${field.id} missing`);
                return false;
              }
            }
          }
          break;

        case 'multipleChoice':
        case 'checkbox':
          console.log('Multiple choice/checkbox question check:');
          console.log('Answer:', questionData.answer);
          // Only validate if the field is required or has a value
          if (question.required || questionData.answer) {
            if (!Array.isArray(questionData.answer) || questionData.answer.length === 0) {
              console.log('Multiple choice/checkbox answer missing or invalid');
              return false;
            }
          }
          break;

        case 'singleChoice':
        case 'dropdown':
        case 'select':
          console.log('Single choice/dropdown question check:');
          console.log('Answer:', questionData.answer);
          // Only validate if the field is required or has a value
          if (question.required || questionData.answer) {
            if (!questionData.answer || questionData.answer.trim() === '') {
              console.log('Single choice/dropdown answer is empty');
              return false;
            }
          }
          break;

        case 'date':
          console.log('Date question check:');
          console.log('Answer:', questionData.answer);
          // Only validate if the field is required or has a value
          if (question.required || questionData.answer) {
            if (!questionData.answer || questionData.answer.trim() === '') {
              console.log('Date answer is empty');
              return false;
            }
          }
          break;

        default:
          console.log('Default question check:');
          console.log('Answer:', questionData.answer);
          // Only validate if the field is required or has a value
          if (question.required || questionData.answer) {
            if (questionData.answer === '' || 
                (Array.isArray(questionData.answer) && questionData.answer.length === 0)) {
              console.log('Answer is empty');
              return false;
            }
          }
      }
    }

    console.log('\nSection completion check result: true');
    return true;
  };

  // Fetch section configuration and calculate initial progress
  const fetchSectionConfig = async () => {
    try {
      if (!user?.profile?.userType) {
        console.debug('No user type found - resetting sections');
        setSections([]);
        setSubmissionItems([]);
        setProgress(0);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      // Get the admin profiles document
      const profilesDocRef = doc(db, 'admin', 'profiles');
      const profilesDoc = await getDoc(profilesDocRef);
      
      if (!profilesDoc.exists()) {
        console.debug('Profile configuration not found');
        setSections([]);
        setSubmissionItems([]);
        setProgress(0);
        setIsLoading(false);
        return;
      }

      const data = profilesDoc.data();
      const userProfileType = data.profileTypes[user.profile.userType];
      
      if (!userProfileType?.sections) {
        console.debug('No sections found for this profile type');
        setSections([]);
        setSubmissionItems([]);
        setProgress(0);
        setIsLoading(false);
        return;
      }

      // Convert sections to array format
      const sectionsArray = Object.entries(userProfileType.sections).map(([id, section]) => ({
        id,
        ...section
      }));

      // Convert sections to submission items
      const items = sectionsArray.map(section => ({
        id: section.id,
        type: section.label,
        status: 'incomplete', // Will be updated in updateProgress
        label: 'Complete Now',
        isNew: false,
        questions: section.questions?.map(q => ({
          id: q.id,
          required: q.required,
          type: q.type,
          repeaterFields: q.type === 'repeater' ? q.repeaterFields?.map(field => ({
            id: field.id,
            required: field.required,
            type: field.type
          })) : null
        })) || []
      }));

      // Calculate initial progress
      const updatedItems = items.map(item => {
        const isComplete = checkSectionCompletion(item.id, item.questions, user.profileSections);
        return {
          ...item,
          status: isComplete ? 'complete' : 'incomplete',
          label: isComplete ? 'Completed' : 'Complete Now'
        };
      });

      // Calculate weighted progress
      const totalWeight = updatedItems.reduce((sum, item) => {
        const requiredQuestions = item.questions?.filter(q => q.required).length || 0;
        return sum + (requiredQuestions || 1);
      }, 0);

      const completedWeight = updatedItems.reduce((sum, item) => {
        if (item.status === 'complete') {
          const requiredQuestions = item.questions?.filter(q => q.required).length || 0;
          return sum + (requiredQuestions || 1);
        }
        return sum;
      }, 0);

      const calculatedProgress = totalWeight > 0 ? 
        Math.round((completedWeight / totalWeight) * 100) : 0;

      setSections(sectionsArray);
      setSubmissionItems(updatedItems);
      setProgress(calculatedProgress);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching section configuration:', error);
      setSections([]);
      setSubmissionItems([]);
      setProgress(0);
      setIsLoading(false);
    }
  };

  // Update progress when profile sections change
  useEffect(() => {
    if (!authLoading) {
      fetchSectionConfig();
    }
  }, [user?.profile?.userType, authLoading, user?.profileSections]);

  // Get missing steps
  const getMissingSteps = () => {
    if (!sections.length || !user?.profile?.userType) {
      return {
        sections: [],
        message: null
      };
    }

    // For new users or empty profileSections, all sections are missing
    if (!user?.profileSections || Object.keys(user.profileSections).length === 0) {
      const missingSections = sections.map(section => ({
        id: section.id,
        label: section.label
      }));

      return {
        sections: missingSections,
        message: 'Complete all required sections in your profile'
      };
    }

    // Get incomplete sections
    const incompleteSections = sections.filter(section => 
      !checkSectionCompletion(section.id, section.questions, user.profileSections)
    ).map(section => ({
      id: section.id,
      label: section.label
    }));

    if (incompleteSections.length > 1) {
      return {
        sections: incompleteSections,
        message: 'Complete all required sections in your profile'
      };
    } else if (incompleteSections.length === 1) {
      return {
        sections: incompleteSections,
        message: `Complete your ${incompleteSections[0].label.toLowerCase()}`
      };
    }

    return {
      sections: [],
      message: null
    };
  };

  return {
    sections,
    progress,
    isLoading,
    submissionItems,
    checkSectionCompletion,
    getMissingSteps
  };
};

export default useProfileProgress; 