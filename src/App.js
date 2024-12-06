import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
// Import Firebase config
import './firebase/config';
// AuthContext import to handle authentication
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ToastProvider } from './components/Toast/ToastContext';

// Import components after context
import Layout from './components/Layout/Layout';
import Dashboard from './backend/pages/Dashboard/Dashboard';
import MyApplications from './backend/pages/MyApplications/MyApplications';
import NewOpportunities from './backend/pages/NewOpportunities/NewOpportunities';
import DataManagement from './backend/pages/DataManagement/DataManagement';
import Subscription from './backend/pages/Subscription/Subscription';
import LoginSignup from './frontend/pages/LoginSignup/LoginSignup';
import Settings from './backend/pages/Settings/Settings';
import HelpCenter from './backend/pages/HelpCenter/HelpCenter';
import ProfileType from './frontend/pages/ProfileType/ProfileType';

// Import Admin components
import AdminLogin from './admin/AdminLogin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard/AdminDashboard';
import AdminLayout from './admin/AdminLayout/AdminLayout';

// Import AdminAuthProvider
import { AdminAuthProvider, useAdminAuth } from './admin/AdminAuth/AdminAuthContext';

// Import styles last
import './App.css';
import './components/Header/DashboardHeader.css';

// Import ProfileQuestions component
import ProfileQuestions from './admin/Questions/Questions';

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
    return <Navigate to="/" replace />;
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

// Update AdminRoute component to use AdminAuthContext
const AdminRoute = ({ children }) => {
  const { adminUser, loading } = useAdminAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

// Add AdminLayout component wrapper
const AdminLayoutWrapper = () => {
  return (
    <AdminRoute>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </AdminRoute>
  );
};

// App component definition last
const App = () => {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <div className="App">
              <Routes>
                <Route path="/" element={<LoginSignup />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route element={<AdminLayoutWrapper />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/questions" element={<ProfileQuestions />} />
                  <Route path="/admin/data-management" element={<DataManagement />} />
                </Route>
                <Route element={<ProtectedLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/my-applications" element={<MyApplications />} />
                  <Route path="/new-opportunities" element={<NewOpportunities />} />
                  <Route path="/data-management" element={<DataManagement />} />
                  <Route path="/subscription" element={<Subscription />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/help-center" element={<HelpCenter />} />
                </Route>
                <Route path="/profile-type" element={<ProfileType />} />
              </Routes>
            </div>
          </AdminAuthProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
};

export default App;
