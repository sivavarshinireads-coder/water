import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<Props> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-center" style={{ height: '100vh' }}>
        <div className="spinner-center" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Community Admins with PENDING or REJECTED status go to pending approval page
  if (user.role === 'COMMUNITY_ADMIN' &&
      (user.approvalStatus === 'PENDING' || user.approvalStatus === 'REJECTED')) {
    return <Navigate to="/pending-approval" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectMap: Record<string, string> = {
      RESIDENT: '/dashboard/user',
      COMMUNITY_ADMIN: '/dashboard/admin',
      MAIN_ADMIN: '/dashboard/main-admin',
    };
    return <Navigate to={redirectMap[user.role] ?? '/login'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
