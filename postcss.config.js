/**
 * PostCSS Configuration
 * This file configures the PostCSS processing pipeline for the project.
 * 
 * Plugins:
 * - tailwindcss: Processes Tailwind CSS utility classes and generates the final CSS
 * - autoprefixer: Automatically adds vendor prefixes to CSS properties for better browser compatibility
 * 
 * @type {import('postcss').Config}
 */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
