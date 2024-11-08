import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
// Import Firebase config
import './firebase/config';
// AuthContext import to handle authentication
import { AuthProvider, useAuth } from './auth/AuthContext';

// Import components after context
import Layout from './backend/components/Layout/Layout';
import Dashboard from './backend/pages/Dashboard/Dashboard';
import MyApplications from './backend/pages/MyApplications/MyApplications';
import NewOpportunities from './backend/pages/NewOpportunities/NewOpportunities';
import DataManagement from './backend/pages/DataManagement/DataManagement';
import Subscription from './backend/pages/Subscription/Subscription';
import Signup from './frontend/pages/Signup/Signup';
import Login from './frontend/pages/Login/Login';
import Settings from './backend/pages/Settings/Settings';
import HelpCenter from './backend/pages/HelpCenter/HelpCenter';
import ProfileType from './frontend/pages/ProfileType/ProfileType';

// Import styles last
import './App.css';
import './backend/components/Header/DashboardHeader.css';

// Move ProtectedRoute component definition here
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Move ProtectedLayout component definition here
const ProtectedLayout = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  );
};

// App component definition last
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes wrapped in Layout */}
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/my-applications" element={<MyApplications />} />
              <Route path="/new-opportunities" element={<NewOpportunities />} />
              <Route path="/data-management" element={<DataManagement />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help-center" element={<HelpCenter />} />
            </Route>

            {/* Protected route for profile type */}
            <Route 
              path="/profile-type" 
              element={
                <ProtectedRoute>
                  <ProfileType />
                </ProtectedRoute>
              } 
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
