/**
 * Tailwind CSS Configuration
 * This file controls the generation and behavior of Tailwind CSS utility classes.
 * 
 * Key Features:
 * - Scans all JS, JSX, TS, and TSX files in the src directory for Tailwind classes
 * - Allows theme customization through the theme.extend object
 * - Supports additional plugins if needed
 * 
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  // Files to scan for class names
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Example of theme customization (uncomment and modify as needed):
      // colors: {
      //   primary: '#your-primary-color',
      //   secondary: '#your-secondary-color',
      // },
      // fontSize: {
      //   'xxs': '0.625rem',
      // },
      // screens: {
      //   '3xl': '1920px',
      // },
    },
  },
  plugins: [
    // Common useful plugins you might want to add:
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/aspect-ratio'),
  ],
} 