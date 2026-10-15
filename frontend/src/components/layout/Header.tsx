import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Flame, Zap, Globe, Menu,
  User as UserIcon, LogOut, ChevronDown, Check
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, profile, systemStatus, logout, updateProfileState } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const supportedLanguages = [
    { code: 'English', name: 'English' },
    { code: 'Hindi', name: 'Hindi (हिन्दी)' },
    { code: 'Bengali', name: 'Bengali (বাংলা)' },
    { code: 'Marathi', name: 'Marathi (मराठी)' },
    { code: 'Telugu', name: 'Telugu (తెలుగు)' },
    { code: 'Tamil', name: 'Tamil (தமிழ்)' },
    { code: 'Gujarati', name: 'Gujarati (ગુજરાતી)' },
    { code: 'Kannada', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'Malayalam', name: 'Malayalam (മലയാളം)' },
    { code: 'Punjabi', name: 'Punjabi (ਪੰਜਾਬੀ)' },
    { code: 'Odia', name: 'Odia (ଓଡ଼ିଆ)' },
  ];

  const currentLang = profile?.preferred_language || 'English';

  const handleSelectLanguage = (lang: string) => {
    updateProfileState({ preferred_language: lang });
    setLangOpen(false);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-6 flex items-center justify-between shrink-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Current Level Pill */}
        {profile?.current_level && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="truncate max-w-[200px]">{profile.current_level}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* Streak Counter */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>Active Streak</span>
        </div>

        {/* XP Points */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold border border-violet-200">
          <Zap className="w-4 h-4 text-violet-500 fill-violet-500" />
          <span>XP Points</span>
        </div>

        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 transition"
          >
            <Globe className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">{currentLang}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {langOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Instruction Language
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {supportedLanguages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleSelectLanguage(l.code)}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>{l.name}</span>
                    {currentLang === l.code && <Check className="w-4 h-4 text-teal-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Provider Status Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
          <span
            className={`w-2 h-2 rounded-full ${
              systemStatus?.ai_engine?.has_api_key ? 'bg-emerald-500' : 'bg-primary-500'
            }`}
          />
          <span className="text-[11px] font-medium text-slate-600">
            {systemStatus?.ai_engine?.mode === 'live_llm' ? 'Live LLM API' : 'Pedagogical Engine'}
          </span>
        </div>

        {/* User Avatar Menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {profile?.display_name ? profile.display_name[0].toUpperCase() : 'U'}
            </div>
            <span className="hidden md:inline text-xs font-semibold text-slate-800 max-w-[120px] truncate">
              {profile?.display_name || user?.email?.split('@')[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{profile?.display_name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
