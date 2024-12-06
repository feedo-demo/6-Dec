/**
 * User Management Service
 * 
 * This file centralizes all user-related operations and data transformations.
 * It provides a consistent interface for:
 * - User data structure
 * - Data transformations
 * - User type handling
 * - Profile updates
 */

import { db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';

// User data transformation functions
export const transformUserData = (authUser, userData, isPending = false) => {
  if (!authUser || !userData) return null;

  // Get first name and last name with proper fallbacks
  const firstName = userData?.profile?.firstName || 
                   userData?.metadata?.firstName || 
                   userData?.firstName || 
                   authUser?.displayName?.split(' ')[0] || 
                   '';
  
  const lastName = userData?.profile?.lastName || 
                  userData?.metadata?.lastName || 
                  userData?.lastName || 
                  authUser?.displayName?.split(' ').slice(1).join(' ') || 
                  '';

  // Create full name from first and last name
  const fullName = userData.profile?.fullName || 
                  `${firstName} ${lastName}`.trim() || 
                  authUser.displayName || 
                  '';

  // Get provider from auth user's provider data
  const provider = authUser.providerData?.[0]?.providerId || userData.profile?.provider || 'password';

  // For Google users, always use auth user's photo URL if available
  const photoURL = provider === 'google.com' && authUser.photoURL 
    ? authUser.photoURL 
    : userData.profile?.photoURL || authUser.photoURL || '';

  // Transform the data ensuring userType is properly set
  const transformedData = {
    profile: {
      authUid: authUser.uid,
      email: userData.profile?.email || authUser.email,
      firstName,
      lastName,
      fullName,
      phoneNumber: userData.profile?.phoneNumber || '',
      professionalSummary: userData.profile?.professionalSummary || '',
      location: userData.profile?.location || '',
      photoURL,
      provider,
      userType: userData.profile?.userType || userData.userType || '',
      isEmailVerified: authUser.emailVerified,
      createdAt: userData.profile?.createdAt || null,
      lastLoginAt: userData.profile?.lastLoginAt || null,
      lastUpdated: userData.profile?.lastUpdated || null
    },
    metadata: {
      ...userData.metadata,
      userType: userData.metadata?.userType || userData.userType || ''
    },
    profileSections: userData.profileSections || {},
    settings: userData.settings || {},
    userType: userData.userType || userData.profile?.userType || '', // Ensure top-level userType is set
    isPending: typeof isPending === 'boolean' ? isPending : !!userData.isPending
  };

  // Debug log
  console.log('Transformed User Data:', {
    input: { authUser, userData, isPending },
    output: transformedData,
    provider,
    photoURL
  });

  return transformedData;
};

// User operations
export const userOperations = {
  // Get user data from Firestore
  async getUserData(uid) {
    try {
      // Check pending users first
      const pendingDoc = await getDoc(doc(db, 'pending_users', uid));
      if (pendingDoc.exists()) {
        return { data: pendingDoc.data(), isPending: true };
      }

      // Check main users collection
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return { data: userDoc.data(), isPending: false };
      }

      // If no data found, return null values explicitly
      return { data: null, isPending: false };
    } catch (error) {
      console.error('Error getting user data:', error);
      return { data: null, isPending: false };
    }
  },

  // Create new user document
  async createUserDocument(uid, userData, isPending = true) {
    const collection = isPending ? 'pending_users' : 'users';
    const userRef = doc(db, collection, uid);
    
    const timestamp = serverTimestamp();
    const userDataWithTimestamp = {
      ...userData,
      createdAt: timestamp,
      lastLoginAt: timestamp
    };

    await setDoc(userRef, userDataWithTimestamp);
    return userDataWithTimestamp;
  },

  // Update user profile
  async updateUserProfile(uid, updates) {
    const userRef = doc(db, 'users', uid);
    const timestamp = serverTimestamp();
    
    // Prepare the update data
    const updateData = {
      'metadata.lastUpdatedAt': timestamp
    };
    
    // Handle profile updates
    if (updates.profile) {
      Object.entries(updates.profile).forEach(([key, value]) => {
        updateData[`profile.${key}`] = value;
      });
      updateData['profile.lastUpdated'] = timestamp;
    }

    // Handle metadata updates
    if (updates.metadata) {
      Object.entries(updates.metadata).forEach(([key, value]) => {
        updateData[`metadata.${key}`] = value;
      });
    }

    // Handle profileSections updates
    if (updates.profileSections) {
      Object.entries(updates.profileSections).forEach(([sectionId, data]) => {
        updateData[`profileSections.${sectionId}`] = data;
      });
    }
    
    // Handle section updates
    if (updates.personal) {
      Object.entries(updates.personal).forEach(([key, value]) => {
        updateData[`personal.${key}`] = value;
      });
      updateData['personal.lastUpdated'] = timestamp;
    }
    
    // Handle education updates
    if (updates.education) {
      updateData.education = {
        ...updates.education,
        lastUpdated: timestamp
      };
    }
    
    if (updates.workExperience) {
      updateData.workExperience = updates.workExperience;
    }
    
    if (updates.settings) {
      Object.entries(updates.settings).forEach(([key, value]) => {
        updateData[`settings.${key}`] = value;
      });
    }

    console.log('Updating Firestore with:', updateData); // Debug log
    
    // Perform the update
    await updateDoc(userRef, updateData);
    
    // Return the updated data with local timestamps for immediate UI update
    return {
      ...updates,
      metadata: {
        ...updates.metadata,
        lastUpdatedAt: new Date()
      }
    };
  },

  // Convert pending user to full user
  async convertPendingToUser(uid, userData) {
    try {
      const batch = writeBatch(db);
      
      // Get the profile type sections from admin config
      const profilesDocRef = doc(db, 'admin', 'profiles');
      const profilesDoc = await getDoc(profilesDocRef);
      
      if (!profilesDoc.exists()) {
        throw new Error('Admin profiles configuration not found');
      }

      const profileTypes = profilesDoc.data().profileTypes;
      const userProfileType = profileTypes[userData.userType];
      
      if (!userProfileType?.sections) {
        throw new Error('No sections found for profile type');
      }

      // Initialize profileSections with empty data
      const profileSections = {};
      
      Object.entries(userProfileType.sections).forEach(([sectionId, section]) => {
        // Initialize profileSections with section structure and empty answers
        profileSections[sectionId] = {
          id: sectionId,
          label: section.label,
          questions: section.questions?.map(question => ({
            id: question.id,
            type: question.type,
            question: question.question,
            required: question.required,
            answer: null
          })) || []
        };
      });

      // Ensure we're not overriding the selected user type and include sections
      const updatedUserData = {
        ...userData,
        isPending: false,
        metadata: {
          ...userData.metadata,
          convertedAt: serverTimestamp(),
          lastUpdatedAt: serverTimestamp(),
          isPending: false,
          userType: userData.userType
        },
        profile: {
          ...userData.profile,
          lastUpdated: serverTimestamp(),
          userType: userData.userType
        },
        userType: userData.userType,
        profileSections // Add initialized sections
      };
      
      // Create new user document
      const userRef = doc(db, 'users', uid);
      batch.set(userRef, updatedUserData);
      
      // Delete pending document
      const pendingRef = doc(db, 'pending_users', uid);
      batch.delete(pendingRef);
      
      // Commit the batch
      await batch.commit();

      // Wait for a moment to ensure Firestore is synchronized
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the fresh data after the update
      const freshUserDoc = await getDoc(userRef);
      if (!freshUserDoc.exists()) {
        throw new Error('Failed to verify user data update');
      }

      // Return the fresh data from Firestore with local timestamps
      const freshData = freshUserDoc.data();
      return {
        ...freshData,
        metadata: {
          ...freshData.metadata,
          convertedAt: new Date(),
          lastUpdatedAt: new Date()
        }
      };
    } catch (error) {
      console.error('Error converting pending user:', error);
      throw error;
    }
  },

  // Delete user data
  async deleteUserData(uid) {
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
  },

  // Add this new function
  async createPendingUser(uid, userData) {
    try {
      const pendingRef = doc(db, 'pending_users', uid);
      const timestamp = serverTimestamp();
      
      // Add timestamps to userData and ensure profile data is preserved
      const userDataWithTimestamp = {
        ...userData,
        metadata: {
          ...userData.metadata,
          createdAt: timestamp,
          lastLoginAt: timestamp
        },
        profile: {
          ...userData.profile,
          lastUpdated: timestamp,
          // Ensure photoURL is preserved
          photoURL: userData.profile?.photoURL || ''
        }
      };

      console.log('Creating pending user with data:', userDataWithTimestamp);

      await setDoc(pendingRef, userDataWithTimestamp);
      return userDataWithTimestamp;
    } catch (error) {
      console.error('Error creating pending user:', error);
      throw error;
    }
  },

  // Update user type
  async updateUserType(uid, selectedType) {
    try {
      // Get current user data
      const { data, isPending } = await this.getUserData(uid);
      
      if (!data) throw new Error('No user data found');

      // Get the profile type sections from admin config
      const profilesDocRef = doc(db, 'admin', 'profiles');
      const profilesDoc = await getDoc(profilesDocRef);
      
      if (!profilesDoc.exists()) {
        throw new Error('Admin profiles configuration not found');
      }

      const profileTypes = profilesDoc.data().profileTypes;
      if (!profileTypes || !profileTypes[selectedType]) {
        throw new Error(`Profile type ${selectedType} not found`);
      }

      const userProfileType = profileTypes[selectedType];
      
      // Initialize profileSections with empty data
      const profileSections = {};
      
      // Only process sections if they exist
      if (userProfileType.sections) {
        Object.entries(userProfileType.sections).forEach(([sectionId, section]) => {
          // Initialize profileSections with section structure and empty answers
          profileSections[sectionId] = {
            id: sectionId,
            label: section.label,
            questions: section.questions?.map(question => ({
              id: question.id,
              type: question.type,
              question: question.question,
              required: question.required,
              answer: null
            })) || []
          };
        });
      }

      // Update the user type at all required levels
      const updatedData = {
        ...data,
        userType: selectedType,
        profile: {
          ...data.profile,
          userType: selectedType,
          userTypeLabel: userProfileType.label || selectedType
        },
        metadata: {
          ...data.metadata,
          userType: selectedType,
          lastUpdatedAt: serverTimestamp()
        },
        profileSections
      };

      // If user is pending, convert them to full user
      if (isPending) {
        return await this.convertPendingToUser(uid, updatedData);
      } else {
        // Otherwise just update the existing user
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, updatedData);
        return updatedData;
      }
    } catch (error) {
      console.error('Error updating user type:', error);
      throw error;
    }
  }
};

// Helper functions
export const createUserDataStructure = (user, data = {}) => {
  console.log('Creating user data structure with:', { user, data }); // Debug log

  // Safely extract first and last name
  const firstName = data?.firstName || user?.displayName?.split(' ')[0] || '';
  const lastName = data?.lastName || user?.displayName?.split(' ').slice(1).join(' ') || '';
  const fullName = data?.displayName || `${firstName} ${lastName}`.trim() || user?.displayName || '';

  // Get the correct provider
  const provider = data?.provider || user?.providerData?.[0]?.providerId || 'email';

  // Create base profile structure with safe defaults
  const profile = {
    firstName,
    lastName,
    fullName,
    email: user?.email || '',
    phoneNumber: data?.phoneNumber || '',
    photoURL: user?.photoURL || data?.photoURL || '',
    provider,
    userType: 'pending',
    lastUpdated: new Date().toISOString()
  };

  // Create the complete user data structure
  const userData = {
    profile,
    metadata: {
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      userType: 'pending',
      firstName,
      lastName,
      email: user?.email || '',
      phoneNumber: data?.phoneNumber || ''
    },
    settings: {
      notifications: true,
      emailPreferences: {
        marketing: true,
        updates: true,
        opportunities: true
      },
      theme: 'light'
    },
    userType: 'pending',
    profileSections: {}
  };

  console.log('Created user data structure:', userData); // Debug log
  return userData;
}; 