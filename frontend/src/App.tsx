import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AppLayout } from './components/layout/AppLayout';
import { OverviewPage } from './pages/OverviewPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { StartupProfilePage } from './pages/StartupProfilePage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Landing & Authentication Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Startup Workspace Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<OverviewPage />} />
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="/roadmap" element={<RoadmapPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/profile" element={<StartupProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Seamless redirects for legacy routes to keep existing bookmarks functional */}
              <Route path="/checklist" element={<Navigate to="/documents" replace />} />
              <Route path="/tenders" element={<Navigate to="/roadmap" replace />} />
              <Route path="/readiness" element={<Navigate to="/dashboard" replace />} />
              <Route path="/eligibility" element={<Navigate to="/roadmap" replace />} />
              <Route path="/applications" element={<Navigate to="/roadmap" replace />} />
              <Route path="/finance" element={<Navigate to="/roadmap" replace />} />
            </Route>
          </Route>

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
