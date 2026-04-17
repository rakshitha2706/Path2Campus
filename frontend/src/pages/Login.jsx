import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Shield, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

const initialForm = {
  name: '',
  email: '',
  password: '',
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const payload =
        mode === 'signup'
          ? { name: form.name, email: form.email, password: form.password }
          : { email: form.email, password: form.password };

      const response = mode === 'signup' ? await authAPI.signup(payload) : await authAPI.login(payload);

      login(response.data.user, response.data.token);
      toast.success(mode === 'signup' ? `Welcome, ${response.data.user.name}!` : 'Logged in successfully');
      navigate('/search');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <GraduationCap size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome to Path2Campus</h1>
          <p className="text-sm text-slate-500 mt-1">Create an account and save your college shortlist</p>
        </div>

        <div className="card p-8 animate-fade-in delay-100">
          <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 mb-6">
            {['login', 'signup'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  mode === item ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                {item === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          <h2 className="text-lg font-semibold text-slate-800 mb-1 text-center">
            {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
          </h2>
          <p className="text-xs text-slate-400 text-center mb-6">
            {mode === 'login' ? 'Access your saved colleges and comparisons' : 'Store your profile and shortlist in MongoDB'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  className="form-input"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                className="form-input"
                placeholder="Enter your password"
                minLength={6}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm font-semibold">
              {loading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : mode === 'login' ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <div className="grid grid-cols-2 gap-3 pt-5 border-t border-slate-100 mt-6">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield size={13} className="text-green-500" />
              <span>Secure Password Auth</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Zap size={13} className="text-blue-500" />
              <span>MongoDB Storage</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4 animate-fade-in delay-200">
          By continuing, you agree to use Path2Campus for educational decisions only.
        </p>

        <button onClick={() => navigate('/')} className="mt-4 w-full text-center text-sm text-blue-600 hover:underline">
          Back to Home
        </button>
      </div>
    </div>
  );
}
