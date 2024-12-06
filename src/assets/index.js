/**
 * Asset Exports
 * 
 * Central file for managing all asset imports and exports
 * Features:
 * - Logo and branding images
 * - Profile/Avatar images
 * - Award badges
 * - FAQ and user images
 * - Other static assets
 */

// Import logos and branding
import logo from './images/logo.png';
import feedoLogo from './images/feedo-logo.png';

// Import award badges
import awardBadge from './images/award-badge.png';

// Import FAQ and profile images
import faqGirl from './images/faq-girl.png';
import girl from './images/girl.png';
import zaid from './images/zaid.png';
import userPhoto from './images/user-photo.svg';

// Card brand images
const cardImages = {
  visa: 'https://js.stripe.com/v3/fingerprinted/img/visa-729c05c240c4bdb47b03ac81d9945bfe.svg',
  mastercard: 'https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg'
};

// Export all assets
export {
  // Logos
  logo,
  feedoLogo,
  
  // Badges
  awardBadge,
  
  // FAQ and Profile Images
  faqGirl,
  girl,
  zaid,
  userPhoto,
  
  // Card images
  cardImages
};

// For debugging
console.log('Assets loaded:', {
  logo,
  feedoLogo,
  awardBadge,
  faqGirl,
  girl,
  zaid,
  userPhoto,
  cardImages
}); 