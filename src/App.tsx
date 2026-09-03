import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Pantry from './pages/Pantry';
import MealPlan from './pages/MealPlan';
import Tips from './pages/Tips';
import Family from './pages/Family';
import Login from './pages/Login';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route path="/" element={<Home />} />
            <Route path="/pantry" element={<Pantry />} />
            <Route path="/meal-plan" element={<MealPlan />} />
            <Route path="/tips" element={<Tips />} />
            <Route path="/family" element={<Family />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
