import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  FileSearch, 
  Files, 
  Scale, 
  CheckSquare2, 
  ShieldAlert, 
  Settings,
  Sparkles,
  Send,
  Landmark,
  Compass
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Startup', path: '/profile', icon: Building2 },
    { label: 'Procurement Roadmap', path: '/roadmap', icon: Compass },
    { label: 'Tender Discovery', path: '/tenders', icon: FileSearch },
    { label: 'Documents', path: '/documents', icon: Files },
    { label: 'Eligibility & Audit', path: '/eligibility', icon: Scale },
    { label: 'Dynamic Checklist', path: '/checklist', icon: CheckSquare2 },
    { label: 'Bid Readiness', path: '/readiness', icon: ShieldAlert },
    { label: 'Applications', path: '/applications', icon: Send },
    { label: 'Funding & Support', path: '/finance', icon: Landmark },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 z-50 lg:z-30 h-screen lg:h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Mobile Header Branding */}
          <div className="lg:hidden flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-extrabold text-slate-900 text-base">ProcureEase 2.0</span>
            <button
              onClick={onClose}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Close
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 block">
              Core Modules
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    // Close sidebar on mobile when navigating
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Bottom Philosophy Card */}
        <div className="p-4 border-t border-slate-100">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/60 border border-slate-200/80">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1 rounded-md bg-blue-100/80 text-blue-700">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                System Philosophy
              </span>
            </div>
            <p className="text-xs font-semibold text-blue-950">
              "AI understands. Rules decide."
            </p>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Every eligibility status and readiness score is deterministic and fully explainable.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
