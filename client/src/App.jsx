import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Campaigns from './components/services/Campaigns';
import Airtime from './components/services/Airtime';
import Voice from './components/services/Voice';
import Data from './components/services/Data';
import USSD from './components/services/USSD';
import { authService } from './services/authService';
import './App.css';

function ProtectedRoute({ children }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sms"
          element={
            <ProtectedRoute>
              <Campaigns />
            </ProtectedRoute>
          }
        />
        <Route
          path="/airtime"
          element={
            <ProtectedRoute>
              <Airtime />
            </ProtectedRoute>
          }
        />
        <Route
          path="/voice"
          element={
            <ProtectedRoute>
              <Voice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data"
          element={
            <ProtectedRoute>
              <Data />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ussd"
          element={
            <ProtectedRoute>
              <USSD />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
