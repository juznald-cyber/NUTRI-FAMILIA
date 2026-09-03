import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isGuest } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-apple-bg flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-apple-blue/20 border-t-apple-blue animate-spin mb-4" />
        <p className="text-sm font-medium text-apple-gray-1">Cargando NutriFamilia...</p>
      </div>
    );
  }

  if (!user && !isGuest) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
