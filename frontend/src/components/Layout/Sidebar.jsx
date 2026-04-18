import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, Search, BookOpen, Heart, GitCompare,
  ChevronLeft, ChevronRight, GraduationCap, X
} from 'lucide-react';

const links = [
  { to: '/',            icon: Home,        label: 'Home' },
  { to: '/search',      icon: Search,      label: 'Find College' },
  { to: '/results',     icon: BookOpen,    label: 'Results' },
  { to: '/compare',     icon: GitCompare,  label: 'Compare' },
  { to: '/saved',       icon: Heart,       label: 'Saved' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const content = (
    <div className={`h-full flex flex-col bg-white border-r border-slate-100 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-100 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
          <GraduationCap size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="font-bold text-slate-800 text-sm leading-tight">Path2Campus</div>
            <div className="text-[10px] text-slate-400 font-medium">AI College Finder</div>
          </div>
        )}
        {/* Mobile close */}
        <button onClick={onClose} className="ml-auto lg:hidden text-slate-400 hover:text-slate-600">
          <X size={18} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={`sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? label : ''}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse button (desktop only) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center p-3 border-t border-slate-100 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        {!collapsed && <span className="ml-2 text-xs font-medium">Collapse</span>}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 flex-shrink-0">
        {content}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <div className="relative z-10 h-full animate-slide-in">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
