import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 lg:px-6 py-3 flex items-center gap-4">
      {/* Mobile menu */}
      <button onClick={onMenuClick} className="lg:hidden text-slate-500 hover:text-blue-600 transition-colors">
        <Menu size={22} />
      </button>

      <div className="flex items-center gap-3 ml-auto">
        {/* Profile */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-24 truncate">{user.name}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-800 truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => { logout(); setDropdownOpen(false); navigate('/login'); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="btn-primary py-2 px-4 text-sm"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
