import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Bot, FileText, HelpCircle,
  BarChart3, Network, Calendar, Layers,
  Brain, Globe2, Settings, Sparkles, BookOpen
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'AI Tutor', path: '/tutor', icon: Bot, badge: 'Live' },
    { label: 'Notes Studio', path: '/notes', icon: FileText },
    { label: 'Quiz Arena', path: '/quizzes', icon: HelpCircle },
    { label: 'Analytics & Gaps', path: '/analytics', icon: BarChart3 },
    { label: 'Concept Maps', path: '/concept-maps', icon: Network },
    { label: 'Study Planner', path: '/study-planner', icon: Calendar },
    { label: 'Flashcards', path: '/flashcards', icon: Layers },
    { label: 'Personal Memory', path: '/memory', icon: Brain },
    { label: 'Shared Knowledge', path: '/shared-knowledge', icon: Globe2 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-primary-500 flex items-center justify-center text-white shrink-0 shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <span className="font-bold text-white text-base tracking-tight block">AI Companion</span>
              <span className="text-[10px] text-teal-400 font-semibold tracking-wider uppercase">SDG 4 Education</span>
            </div>
          )}
        </NavLink>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-teal-600/20 text-teal-400 border border-teal-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto text-[10px] font-semibold bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* UN SDG Goal 4 Footer */}
      {!collapsed && (
        <div className="p-4 m-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-teal-400 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>UN SDG Goal 4</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Ensuring inclusive, equitable quality education for lifelong learning across all stages.
          </p>
        </div>
      )}
    </aside>
  );
};
