import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-stone-600">Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve intended destination path in state per D-08
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
