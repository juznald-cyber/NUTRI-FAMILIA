import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Pantry from './pages/Pantry';
import MealPlan from './pages/MealPlan';
import Tips from './pages/Tips';
import Family from './pages/Family';

const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/pantry" element={<Pantry />} />
        <Route path="/meal-plan" element={<MealPlan />} />
        <Route path="/tips" element={<Tips />} />
        <Route path="/family" element={<Family />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
