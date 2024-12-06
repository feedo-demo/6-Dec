/**
 * Profile Type Icons
 * 
 * Shared icons configuration for profile types
 * Uses react-icons for consistent styling
 */

import { 
  FiUser, 
  FiBriefcase, 
  FiBook, 
  FiHeart, 
  FiActivity,
  FiMonitor,
  FiPenTool,
  FiDollarSign,
  FiCoffee,
  FiGlobe,
  FiAward,
  FiMusic
} from 'react-icons/fi';

export const PROFILE_ICONS = [
  { id: 'user', icon: FiUser, label: 'User' },
  { id: 'business', icon: FiBriefcase, label: 'Business' },
  { id: 'education', icon: FiBook, label: 'Education' },
  { id: 'health', icon: FiHeart, label: 'Health' },
  { id: 'sports', icon: FiActivity, label: 'Sports' },
  { id: 'tech', icon: FiMonitor, label: 'Technology' },
  { id: 'creative', icon: FiPenTool, label: 'Creative' },
  { id: 'finance', icon: FiDollarSign, label: 'Finance' },
  { id: 'food', icon: FiCoffee, label: 'Food' },
  { id: 'travel', icon: FiGlobe, label: 'Travel' },
  { id: 'science', icon: FiAward, label: 'Science' },
  { id: 'music', icon: FiMusic, label: 'Music' }
]; 