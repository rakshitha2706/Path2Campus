import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

import AppLayout from './components/Layout/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import InputForm from './pages/InputForm';
import Results from './pages/Results';
import CollegeDetail from './pages/CollegeDetail';
import Comparison from './pages/Comparison';
import Dashboard from './pages/Dashboard';
import Saved from './pages/Saved';
import ChatBot from './components/ChatBot';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-client-id';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1e293b',
                color: '#fff',
                fontSize: '14px',
                borderRadius: '99px',
                padding: '10px 20px',
              },
            }}
          />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={
              <AppLayout>
                <Routes>
                  <Route path="/search" element={<InputForm />} />
                  <Route path="/results" element={<Results />} />
                  <Route path="/:exam/college/:id" element={<CollegeDetail />} />
                  <Route path="/compare" element={<Comparison />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/saved" element={<Saved />} />
                </Routes>
                <ChatBot />
              </AppLayout>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
