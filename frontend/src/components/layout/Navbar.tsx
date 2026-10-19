import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Bell, 
  Menu, 
  X, 
  Clock, 
  Building2,
  CheckCircle2,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Derive current page context
  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/': return 'Home';
      case '/dashboard': return 'Dashboard';
      case '/roadmap': return 'Procurement Roadmap';
      case '/profile': return 'My Startup Profile';
      case '/tenders': return 'Tenders';
      case '/documents': return 'Documents';
      case '/eligibility': return 'Eligibility Explainer';
      case '/checklist': return 'Action Checklist';
      case '/readiness': return 'Bid Readiness Audit';
      case '/applications': return 'Applications & Tracking';
      case '/finance': return 'Financial Support Schemes';
      case '/settings': return 'Settings';
      default: return 'Workspace';
    }
  };

  const sampleNotifications = [
    {
      id: 1,
      title: 'Tender Corrigendum Detected',
      desc: 'Deadline extended: 20 Oct → 28 Oct 2026',
      time: '2h ago',
      type: 'info'
    },
    {
      id: 2,
      title: 'Action Item Pending',
      desc: 'ISO 9001 Certificate is missing for active tender',
      time: 'Yesterday',
      type: 'urgent'
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle + Logo + Current Context */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/25">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-slate-900 text-base">ProcureEase</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">2.0</span>
              </div>
            </div>
          </Link>

          <div className="hidden sm:block h-5 w-px bg-slate-200 mx-1" />

          {/* Current Page Context */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Context:</span>
            <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
              {getPageTitle(location.pathname)}
            </span>
          </div>
        </div>

        {/* Right: Notifications + User Profile Area */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tender Alerts</span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">2 New</span>
                </div>
                <div className="space-y-1.5">
                  {sampleNotifications.map((notif) => (
                    <div key={notif.id} className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900">{notif.title}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{notif.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User / Profile Area */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                {user ? user.name.slice(0, 2).toUpperCase() : 'PE'}
              </div>
              <div className="hidden md:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 leading-none truncate max-w-[120px]">
                    {user?.company_name || 'My Startup'}
                  </span>
                  {user?.is_demo && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 leading-none">
                      Demo
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 leading-none block mt-0.5">
                  {user?.name || 'Founder'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="p-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-900">{user?.company_name || 'My Startup'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email || 'founder@startup.in'}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                      <CheckCircle2 className="w-3 h-3" />
                      Active Founder Session
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>My Startup Profile</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span>Procurement Roadmap</span>
                  </Link>
                  <button
                    onClick={async () => {
                      setShowUserMenu(false);
                      await logout();
                      navigate('/login');
                    }}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Logout Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
