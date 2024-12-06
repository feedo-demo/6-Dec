/**
 * FAQ Section Component
 * 
 * A comprehensive FAQ interface that provides:
 * - Expandable FAQ items with smooth animations
 * - Question and answer display
 * - Progress tracking for answered questions
 * - Interactive hover states
 * - Accessibility features
 * 
 * Features:
 * - Animated accordion functionality
 * - Progress tracking
 * - Staggered animations
 * - Keyboard navigation
 * - ARIA attributes for accessibility
 */

import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import AnimatedNumber from '../../../../../components/Animated/AnimatedNumber';
import './FAQ.css';

const FAQ = () => {
  /**
   * State Management
   */
  const [openIndex, setOpenIndex] = useState(null);         // Tracks currently open FAQ item
  const [totalQuestions] = useState(6);                     // Total number of FAQ items
  const [answeredQuestions, setAnsweredQuestions] = useState(0); // Tracks viewed questions

  /**
   * FAQ data array
   * Each item contains:
   * - Question text
   * - Answer text
   * - Optional metadata
   */
  const faqItems = [
    {
      question: "What is the purpose of the AI auto-fill feature?",
      answer: "The AI auto-fill feature helps streamline your application process..."
    },
    // ... other FAQ items
  ];

  /**
   * Handle FAQ item toggle
   * - Updates open/closed state
   * - Tracks viewed questions
   * - Manages animations
   * @param {number} index - Index of clicked FAQ item
   */
  const toggleFaq = (index) => {
    if (openIndex !== index) {
      setAnsweredQuestions(prev => Math.min(prev + 1, totalQuestions));
    }
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-section">
      {/* Header with progress tracking */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title">Faqs</h2>
        <div className="text-sm text-gray-500">
          <AnimatedNumber value={answeredQuestions} /> of <AnimatedNumber value={totalQuestions} /> questions answered
        </div>
      </div>

      {/* FAQ items list */}
      <div className="faq-list">
        {faqItems.map((item, index) => (
          <div 
            key={index}
            className={`faq-item ${openIndex === index ? 'active' : ''}`}
          >
            {/* Question button */}
            <button
              className="faq-question"
              onClick={() => toggleFaq(index)}
              aria-expanded={openIndex === index}
            >
              <span>{item.question}</span>
              <FiChevronDown className="faq-icon" />
            </button>

            {/* Answer content */}
            <div className="faq-answer">
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Export the FAQ component
 * This component provides:
 * - Interactive FAQ functionality
 * - Progress tracking
 * - Animated transitions
 * - Accessibility features
 * - Responsive design
 */
export default FAQ; 