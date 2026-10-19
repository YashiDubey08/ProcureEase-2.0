import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import type { BackendHealthResponse } from '../../types';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [health, setHealth] = useState<BackendHealthResponse | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const data = await api.getHealth();
        setHealth(data);
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: 'Foundation Status', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Startup Profile', path: '/profile' },
    { label: 'Tender Workspace', path: '/workspace' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">ProcureEase</span>
                <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">2.0</span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">Tender-to-Action Intelligence</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Backend Engine Status Pill */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
              title={isOnline ? `Backend Connected: ${health?.project} with PyMuPDF ${health?.pdf_engine?.version}` : 'Connecting to backend...'}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="font-semibold">{isOnline ? 'Flask & SQLite Active' : 'Backend Connecting...'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
