/**
 * Main App Component
 * Handles routing and layout structure
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Settings from './backend for user/pages/Settings/Settings';
// ... other imports ...

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/settings" element={<Settings />} />
          {/* ... other routes ... */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App; 