import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import DashboardRoutes from './routes/DashboardRoutes';

const RootRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  const map = { RESIDENT: '/dashboard/user', COMMUNITY_ADMIN: '/dashboard/admin', MAIN_ADMIN: '/dashboard/main-admin' };
  return <Navigate to={map[user.role]} replace />;
};

const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/pending-approval" element={<PendingApprovalPage />} />
        <Route path="/dashboard/*" element={<DashboardRoutes />} />
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
