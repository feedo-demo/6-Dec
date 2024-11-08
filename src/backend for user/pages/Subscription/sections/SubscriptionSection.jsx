/**
 * Subscription Section Component
 * Renders the subscription plans with pricing toggle
 * All styles moved to SubscriptionSection.css
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import './SubscriptionSection.css';

const Subscription = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Basic',
      monthlyPrice: 29,
      annualPrice: 290,
      features: [
        'AI Resume Analysis',
        '10 Job Applications/month',
        'Basic Cover Letter AI',
        'Job Match Recommendations',
        'Email Support'
      ],
      popular: false,
      active: true,
    },
    {
      name: 'Pro',
      monthlyPrice: 59,
      annualPrice: 590,
      features: [
        'Advanced AI Resume Optimization',
        'Unlimited Job Applications',
        'Advanced Cover Letter AI',
        'Priority Job Matches',
        'Interview AI Preparation',
        'Priority Support'
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      monthlyPrice: 99,
      annualPrice: 990,
      features: [
        'Full AI Career Assistant',
        'Unlimited Everything',
        'Custom AI Cover Letters',
        'Mock Interview AI Sessions',
        'Career Path AI Planning',
        '24/7 Priority Support',
        'Salary Negotiation AI'
      ],
      popular: false,
    },
  ];

  return (
    <section className="section-wrapper">
      <div className="background-animation" />
      
      <div className="toggle-container">
        <div className="toggle-wrapper">
          <span className={!isAnnual ? 'active' : ''}>Monthly</span>
          <button 
            className={`toggle-button ${isAnnual ? 'active' : ''}`} 
            onClick={() => setIsAnnual(!isAnnual)}
            aria-checked={isAnnual}
            role="switch"
          >
            <motion.div 
              className="toggle-slider"
              initial={false}
              animate={{ 
                x: isAnnual ? 24 : 4,
                width: '16px'
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                mass: 0.8
              }}
            />
          </button>
          <span className={isAnnual ? 'active' : ''}>Annual</span>
        </div>
      </div>

      <div className="content-wrapper">
        <div className="cards-container">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div className={`plan-card ${plan.popular ? 'popular' : ''} ${plan.active ? 'active' : ''}`}>
                {plan.popular && <div className="popular-badge">Most Popular</div>}
                {plan.active && <div className="active-badge">Current Plan</div>}
                <h3>{plan.name}</h3>
                <p className="description">Perfect for {plan.name.toLowerCase()} users</p>
                <div className="price-tag">
                  <span>$</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      className="amount"
                      key={isAnnual ? 'annual' : 'monthly'}
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      transition={{ 
                        duration: 0.4,
                        ease: [0.34, 1.56, 0.64, 1]
                      }}
                    >
                      {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </motion.span>
                  </AnimatePresence>
                  <span className="period">/mo</span>
                </div>
                <ul className="features-list">
                  {plan.features.map((feature) => (
                    <li key={feature} className="feature-item">
                      <span className="check-icon">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  className={`select-button ${plan.popular ? 'popular' : ''} ${plan.active ? 'active' : ''}`}
                  disabled={plan.active}
                >
                  {plan.active ? 'Current Plan' : 'Get Started'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Subscription; 