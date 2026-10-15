import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import {
  User, Settings, Globe, Shield, Sparkles,
  Save, CheckCircle2, AlertCircle, KeyRound, Cpu
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const ProfileSettingsPage: React.FC = () => {
  const { user, profile, systemStatus, updateProfileState, refreshSystemStatus } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [currentLevel, setCurrentLevel] = useState(profile?.current_level || '');
  const [institution, setInstitution] = useState(profile?.institution_or_board || '');
  const [preferredLang, setPreferredLang] = useState(profile?.preferred_language || 'English');
  const [preferredStyle, setPreferredStyle] = useState(profile?.preferred_style || 'intuitive_analogy');
  const [dailyMinutes, setDailyMinutes] = useState(profile?.daily_study_minutes || 60);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // External AI configuration state
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiProviderInput, setApiProviderInput] = useState('gemini');
  const [savingKey, setSavingKey] = useState(false);
  const [keySuccess, setKeySuccess] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const updated = await api.updateProfile({
        display_name: displayName,
        current_level: currentLevel,
        institution_or_board: institution || undefined,
        preferred_language: preferredLang,
        preferred_style: preferredStyle,
        daily_study_minutes: Number(dailyMinutes),
      });
      updateProfileState(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAIConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;
    setSavingKey(true);
    setKeyError(null);
    setKeySuccess(false);

    try {
      await api.configureAI(apiKeyInput.trim(), apiProviderInput);
      await refreshSystemStatus();
      setKeySuccess(true);
      setApiKeyInput('');
      setTimeout(() => setKeySuccess(false), 4000);
    } catch (err: any) {
      setKeyError(err.message || 'Failed to update AI configuration.');
    } finally {
      setSavingKey(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile & Platform Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your flexible educational level, preferred instruction language, and inspect AI engine configurations.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Educational profile updated successfully. Your tutor will adapt to these settings immediately.</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Educational Profile Settings Card */}
      <Card className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Learner Profile</h2>
            <p className="text-xs text-slate-500">Account: {user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Display Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Class / Degree / Level</label>
              <input
                type="text"
                required
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value)}
                placeholder="e.g. Class 10 CBSE / B.Tech 2nd Year"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Institution / School Board</label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g. CBSE / Delhi University"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Preferred Explanation Language</label>
              <select
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="Bengali">Bengali (বাংলা)</option>
                <option value="Marathi">Marathi (मराठी)</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
                <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                <option value="Malayalam">Malayalam (മലയാളം)</option>
                <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                <option value="Odia">Odia (ଓଡ଼ିଆ)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Pedagogical Style</label>
              <select
                value={preferredStyle}
                onChange={(e) => setPreferredStyle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
              >
                <option value="intuitive_analogy">Intuitive Real-World Analogies</option>
                <option value="step_by_step">Step-by-Step Problem Solving</option>
                <option value="academic_rigorous">Rigorous Mathematical / Academic Deep Dive</option>
                <option value="visual_conceptual">Visual & Conceptual Graphs</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">Daily Study Target</label>
              <span className="text-xs font-bold text-teal-600">{dailyMinutes} minutes/day</span>
            </div>
            <input
              type="range"
              min={15}
              max={180}
              step={15}
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(Number(e.target.value))}
              className="w-full accent-teal-600"
            />
          </div>

          <Button type="submit" variant="primary" size="md" isLoading={saving} leftIcon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>
        </form>
      </Card>

      {/* AI Provider & Engine Status Card */}
      <Card className="p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">AI / ML Engine Diagnostics</h2>
            <p className="text-xs text-slate-500">Inspect active LLM provider, embedding model, and cost controls</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Provider Mode</span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  systemStatus?.ai_engine?.has_api_key ? 'bg-emerald-500' : 'bg-primary-500'
                }`}
              />
              <span className="font-bold text-slate-900">
                {systemStatus?.ai_engine?.mode === 'live_llm' ? 'Live Cloud LLM API' : 'Built-in Pedagogical Engine'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{systemStatus?.ai_engine?.message}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Configured Model</span>
            <span className="font-bold text-slate-900 font-mono">
              {systemStatus?.ai_engine?.model || 'gemini-1.5-flash'}
            </span>
            <span className="text-[11px] text-slate-500 block">
              Provider: {systemStatus?.ai_engine?.provider || 'Google Gemini'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
          <strong className="text-slate-900 font-bold mb-1 flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-slate-500" />
            Configuring External API Keys
          </strong>
          To enable live cloud LLM calls via Google Gemini, Groq, or OpenAI, you can paste your key below or set <code className="bg-slate-200 px-1 rounded font-mono text-[11px]">LLM_API_KEY</code> and <code className="bg-slate-200 px-1 rounded font-mono text-[11px]">LLM_PROVIDER</code> in your <code className="bg-slate-200 px-1 rounded font-mono text-[11px]">.env</code> file. Without an external key, our built-in pedagogical knowledge engine answers domain questions locally.
        </div>

        {/* Interactive API Key Form */}
        <form onSubmit={handleSaveAIConfig} className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Connect Live Cloud AI Key (Gemini, Groq, or OpenAI)
            </span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-semibold text-purple-600 hover:text-purple-700 underline"
            >
              Get Free Gemini Key ↗
            </a>
          </div>

          {keySuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>AI credentials updated! The platform is now running on live cloud AI inference.</span>
            </div>
          )}

          {keyError && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{keyError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Provider</label>
              <select
                value={apiProviderInput}
                onChange={(e) => setApiProviderInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
              >
                <option value="gemini">Google Gemini (Free tier available)</option>
                <option value="groq">Groq (Ultra-fast Llama 3)</option>
                <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">API Key</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Paste your API Key (e.g. AIzaSy...)"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={savingKey}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Activate AI
                </Button>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500">
            Your key is stored securely in your local environment file and used solely for educational queries in this workspace.
          </p>
        </form>
      </Card>
    </div>
  );
};
