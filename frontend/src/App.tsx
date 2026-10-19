import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { StartupProfilePage } from './pages/StartupProfilePage';
import { TendersPage } from './pages/TendersPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { EligibilityPage } from './pages/EligibilityPage';
import { ChecklistPage } from './pages/ChecklistPage';
import { ReadinessPage } from './pages/ReadinessPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { FinancePage } from './pages/FinancePage';
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
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/roadmap" element={<DashboardPage />} />
              <Route path="/profile" element={<StartupProfilePage />} />
              <Route path="/tenders" element={<TendersPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/eligibility" element={<EligibilityPage />} />
              <Route path="/checklist" element={<ChecklistPage />} />
              <Route path="/readiness" element={<ReadinessPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/finance" element={<FinancePage />} />
              <Route path="/settings" element={<SettingsPage />} />
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
