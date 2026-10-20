import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Menu, 
  X, 
  ChevronDown, 
  LogOut,
  Settings
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
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/': return 'Home';
      case '/dashboard': return 'Overview';
      case '/roadmap': return 'My Roadmap';
      case '/documents': return 'My Documents';
      case '/profile': return 'Startup Profile';
      case '/settings': return 'Account Settings';
      default: return 'Workspace';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200/80 backdrop-blur-xs">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle + Logo + Current Page Title */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold tracking-tight text-slate-900 text-base">ProcureEase</span>
          </Link>

          <div className="hidden sm:block h-4 w-px bg-slate-200 mx-1" />

          {/* Current Page Context */}
          <span className="hidden sm:inline-block text-xs font-medium text-slate-500">
            {getPageTitle(location.pathname)}
          </span>
        </div>

        {/* Right: User Profile Area */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                {user ? user.name.slice(0, 2).toUpperCase() : 'PE'}
              </div>
              <div className="hidden md:block">
                <span className="text-xs font-semibold text-slate-900 block leading-tight truncate max-w-[130px]">
                  {user?.company_name || 'My Startup'}
                </span>
                <span className="text-[11px] text-slate-400 block leading-tight">
                  {user?.name || 'Founder'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-md p-2 z-50 text-xs">
                <div className="px-2.5 py-2 border-b border-slate-100 mb-1">
                  <p className="font-semibold text-slate-900 truncate">{user?.company_name || 'My Startup'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email || 'founder@startup.in'}</p>
                </div>

                <div className="space-y-0.5">
                  <Link
                    to="/dashboard"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span>Overview</span>
                  </Link>
                  <Link
                    to="/roadmap"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span>My Roadmap</span>
                  </Link>
                  <Link
                    to="/documents"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span>My Documents</span>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span>Startup Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Account Settings</span>
                  </Link>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={async () => {
                      setShowUserMenu(false);
                      await logout();
                      navigate('/login');
                    }}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-md text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Log Out</span>
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
