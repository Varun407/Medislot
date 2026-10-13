import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="pulse-dot" style={{ width: '20px', height: '20px', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--slate-500)', fontWeight: 600 }}>Authenticating session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user || !role) {
    if (allowedRoles.includes('ADMIN')) {
      return <Navigate to="/control-center/login" state={{ from: location }} replace />;
    }
    if (allowedRoles.includes('DOCTOR')) {
      return <Navigate to="/doctor/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/patient/login" state={{ from: location }} replace />;
  }

  // Wrong role: redirect to user's assigned portal
  if (!allowedRoles.includes(role)) {
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
    return <Navigate to="/patient/dashboard" replace />;
  }

  // If Doctor and pending verification
  if (role === 'DOCTOR') {
    const isPending = user.verificationStatus === 'PENDING' || user.status === 'PENDING';
    const isPendingPath = location.pathname === '/doctor/pending' || location.pathname === '/doctor/profile';

    if (isPending && !isPendingPath) {
      return <Navigate to="/doctor/pending" replace />;
    }
  }

  return <>{children}</>;
};
