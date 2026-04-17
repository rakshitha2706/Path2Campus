import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { GraduationCap, Shield, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await authAPI.googleLogin(credentialResponse.credential);
      login(res.data.user, res.data.token);
      toast.success(`Welcome, ${res.data.user.name}! 🎉`);
      navigate('/search');
    } catch (err) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <GraduationCap size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome to Path2Campus</h1>
          <p className="text-sm text-slate-500 mt-1">Your AI-powered college decision partner</p>
        </div>

        {/* Card */}
        <div className="card p-8 animate-fade-in delay-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-1 text-center">Sign in to continue</h2>
          <p className="text-xs text-slate-400 text-center mb-6">Save colleges, compare, and track your shortlist</p>

          <div className="flex justify-center mb-6">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                Signing in...
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => toast.error('Google login failed')}
                theme="outline"
                size="large"
                shape="rectangular"
                text="signin_with_google"
              />
            )}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield size={13} className="text-green-500" />
              <span>Secure Google Auth</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Zap size={13} className="text-blue-500" />
              <span>Instant Access</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4 animate-fade-in delay-200">
          By signing in, you agree to use Path2Campus for educational decisions only.
        </p>

        <button
          onClick={() => navigate('/')}
          className="mt-4 w-full text-center text-sm text-blue-600 hover:underline animate-fade-in delay-300"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
