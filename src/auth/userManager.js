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
export const transformUserData = (authUser, firestoreData, isPending = false) => {
  if (!firestoreData) return null;

  console.log('Transform Input:', { 
    authUser: JSON.parse(JSON.stringify(authUser)), 
    firestoreData: JSON.parse(JSON.stringify(firestoreData)), 
    isPending 
  });

  // Get first name and last name with proper fallbacks
  const firstName = firestoreData.profile?.firstName || 
                   firestoreData.metadata?.firstName || 
                   firestoreData.personal?.firstName || 
                   authUser.displayName?.split(' ')[0] || 
                   '';
  
  const lastName = firestoreData.profile?.lastName || 
                  firestoreData.metadata?.lastName || 
                  firestoreData.personal?.lastName || 
                  authUser.displayName?.split(' ').slice(1).join(' ') || 
                  '';

  // Create full name from first and last name
  const fullName = firestoreData.profile?.fullName || 
                  `${firstName} ${lastName}`.trim() || 
                  authUser.displayName || 
                  '';

  // Ensure we have a proper profile structure
  const profile = {
    authUid: authUser.uid,
    email: firestoreData.profile?.email || authUser.email,
    firstName,
    lastName,
    fullName,
    phoneNumber: firestoreData.profile?.phoneNumber || firestoreData.metadata?.phoneNumber || '',
    professionalSummary: firestoreData.profile?.professionalSummary || '',
    location: firestoreData.profile?.location || firestoreData.metadata?.location || '',
    photoURL: firestoreData.profile?.photoURL || authUser.photoURL || '',
    provider: firestoreData.profile?.provider || authUser.providerData[0]?.providerId || 'email',
    userType: firestoreData.profile?.userType || firestoreData.metadata?.userType || '',
    isEmailVerified: authUser.emailVerified,
    createdAt: firestoreData.metadata?.createdAt || firestoreData.createdAt,
    lastLoginAt: firestoreData.metadata?.lastLoginAt || firestoreData.lastLoginAt,
    lastUpdated: firestoreData.profile?.lastUpdated || serverTimestamp()
  };

  // Create education data structure
  const education = {
    degreeLevel: firestoreData.education?.degreeLevel || '',
    fieldOfStudy: firestoreData.education?.fieldOfStudy || '',
    institutionName: firestoreData.education?.institutionName || '',
    graduationDate: firestoreData.education?.graduationDate || null,
    gpa: firestoreData.education?.gpa || null,
    academicAchievements: firestoreData.education?.academicAchievements || '',
    lastUpdated: firestoreData.education?.lastUpdated || null
  };

  console.log('Created Profile:', JSON.parse(JSON.stringify(profile)));

  // Create the complete transformed data structure
  const transformedData = {
    ...authUser,
    profile,
    education, // Add education data to transformed structure
    workExperience: firestoreData.workExperience || [],
    metadata: {
      ...firestoreData.metadata,
      firstName,
      lastName,
      email: authUser.email,
      phoneNumber: profile.phoneNumber,
      location: profile.location
    },
    settings: firestoreData.settings || {
      notifications: true,
      emailPreferences: {
        marketing: true,
        updates: true,
        opportunities: true
      },
      theme: 'light'
    },
    isPending
  };

  console.log('Transformed Output:', JSON.parse(JSON.stringify(transformedData)));
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
    
    // Handle section updates
    if (updates.personal) {
      Object.entries(updates.personal).forEach(([key, value]) => {
        updateData[`personal.${key}`] = value;
      });
      updateData['personal.lastUpdated'] = timestamp;
    }
    
    // Handle education updates - Updated this section
    if (updates.education) {
      // Directly set all education fields
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
      // Create a new batch
      const batch = writeBatch(db);
      
      // Create new user document
      const userRef = doc(db, 'users', uid);
      batch.set(userRef, userData);
      
      // Delete pending document
      const pendingRef = doc(db, 'pending_users', uid);
      batch.delete(pendingRef);
      
      // Commit the batch
      await batch.commit();
      return userData;
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
      
      // Add timestamps to userData
      const userDataWithTimestamp = {
        ...userData,
        metadata: {
          ...userData.metadata,
          createdAt: timestamp,
          lastLoginAt: timestamp
        }
      };

      await setDoc(pendingRef, userDataWithTimestamp);
      return userDataWithTimestamp;
    } catch (error) {
      console.error('Error creating pending user:', error);
      throw error;
    }
  }
};

// Helper functions
export const createUserDataStructure = (authUser, additionalData = {}, userType = null) => {
  const timestamp = serverTimestamp();
  
  // Get first and last name with proper fallbacks
  const firstName = additionalData.firstName || 
                   authUser.displayName?.split(' ')[0] || 
                   '';
  
  const lastName = additionalData.lastName || 
                  authUser.displayName?.split(' ').slice(1).join(' ') || 
                  '';

  // Create full name
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    personal: {
      firstName,    // Add these explicitly
      lastName,     // Add these explicitly
      fullName,     // Add these explicitly
      email: authUser.email || '',
      phoneNumber: additionalData.phoneNumber || '',
      professionalSummary: '',
      location: '',
      lastUpdated: timestamp
    },
    education: {
      degreeLevel: '',
      fieldOfStudy: '',
      institutionName: '',
      graduationDate: null,
      gpa: null,
      academicAchievements: '',
      lastUpdated: timestamp
    },
    workExperience: [],
    metadata: {
      firstName,    // Add these explicitly
      lastName,     // Add these explicitly
      email: authUser.email,
      phoneNumber: additionalData.phoneNumber || '',
      createdAt: timestamp,
      lastLoginAt: timestamp,
      lastUpdatedAt: timestamp,
      isEmailVerified: authUser.emailVerified,
      provider: authUser.providerData[0]?.providerId || 'email',
      userType: userType || additionalData.userType || '',
      status: 'active'
    },
    profile: {      // Add profile section
      firstName,
      lastName,
      fullName,
      email: authUser.email,
      phoneNumber: additionalData.phoneNumber || '',
      provider: authUser.providerData[0]?.providerId || 'email',
      authUid: authUser.uid,
      lastUpdated: timestamp
    },
    settings: {
      notifications: true,
      emailPreferences: {
        marketing: true,
        updates: true,
        opportunities: true
      },
      theme: 'light'
    }
  };
}; 