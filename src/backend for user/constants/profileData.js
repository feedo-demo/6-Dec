/**
 * Profile Data Constants and Helper Functions
 */

// Fallback profile image if user has no photo
export const FALLBACK_PROFILE_IMAGE = 'https://via.placeholder.com/150';

// Helper function to generate emoji avatar based on user ID
export const getEmojiAvatar = (uid) => {
  return `https://api.dicebear.com/6.x/bottts/svg?seed=${uid}`;
};

// Helper function to generate custom user ID
export const createCustomUserId = (firstName, lastName, randomSuffix = true) => {
  // Convert to lowercase and remove special characters
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Create base ID
  let customId = `${cleanFirst}-${cleanLast}`;
  
  // Add random suffix for uniqueness if requested
  if (randomSuffix) {
    const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp
    const random = Math.random().toString(36).substring(2, 6); // 4 random alphanumeric characters
    customId += `-${timestamp}${random}`;
  }
  
  return customId;
};