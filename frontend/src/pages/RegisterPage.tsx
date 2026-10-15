import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/common/Button';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [educationalCategory, setEducationalCategory] = useState('undergraduate');
  const [currentLevel, setCurrentLevel] = useState('B.Tech Computer Science 2nd Year');
  const [institution, setInstitution] = useState('');
  const [subjectsStr, setSubjectsStr] = useState('Computer Science, Mathematics, Physics');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [preferredStyle, setPreferredStyle] = useState('intuitive_analogy');
  const [dailyMinutes, setDailyMinutes] = useState(60);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categoryDefaults: Record<string, { level: string; instLabel: string; instPlaceholder: string }> = {
    school: {
      level: 'Class 10 (Secondary)',
      instLabel: 'School Board / Curriculum',
      instPlaceholder: 'CBSE / ICSE / State Board',
    },
    undergraduate: {
      level: 'B.Tech / B.Sc / BCA / B.Com',
      instLabel: 'University / College',
      instPlaceholder: 'University of Delhi / IIT / VTU',
    },
    postgraduate: {
      level: 'M.Tech / M.Sc / MCA / MBA / Ph.D',
      instLabel: 'University / Institute',
      instPlaceholder: 'Indian Institute of Science / IIM',
    },
    competitive: {
      level: 'JEE / NEET / UPSC / GATE / CAT Aspirant',
      instLabel: 'Target Examination',
      instPlaceholder: 'UPSC CSE / JEE Advanced / GATE CS',
    },
    vocational: {
      level: 'Diploma / Technical Skill Track',
      instLabel: 'Vocational Institute',
      instPlaceholder: 'Polytechnic / Industrial Training',
    },
    independent: {
      level: 'Independent Lifelong Learner',
      instLabel: 'Focus Domain',
      instPlaceholder: 'Self-Taught Computer Science / Data Science',
    },
  };

  const handleCategoryChange = (cat: string) => {
    setEducationalCategory(cat);
    if (categoryDefaults[cat]) {
      setCurrentLevel(categoryDefaults[cat].level);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const subjects = subjectsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await register({
        email,
        password,
        display_name: displayName,
        educational_category: educationalCategory,
        current_level: currentLevel,
        institution_or_board: institution || null,
        subjects_of_interest: subjects,
        preferred_language: preferredLanguage,
        preferred_style: preferredStyle,
        daily_study_minutes: Number(dailyMinutes),
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200/80 shadow-lg p-8 md:p-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-primary-600 flex items-center justify-center text-white shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-slate-900">AI Companion</span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">Create Learner Profile</h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure your personalized educational journey across any school, university, or exam stage.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Account Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Display Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav@example.edu"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>

          {/* Educational Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Educational Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'school', label: 'School (K-12)' },
                { id: 'undergraduate', label: 'Undergraduate' },
                { id: 'postgraduate', label: 'Postgraduate & Research' },
                { id: 'competitive', label: 'Competitive Exams' },
                { id: 'vocational', label: 'Vocational / Diploma' },
                { id: 'independent', label: 'Independent Learner' },
              ].map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition ${
                    educationalCategory === cat.id
                      ? 'bg-teal-50 text-teal-700 border-teal-500 ring-1 ring-teal-500'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Level Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Class / Level / Track</label>
              <input
                type="text"
                required
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value)}
                placeholder="e.g. Class 10, B.Tech 2nd Year, UPSC Aspirant"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {categoryDefaults[educationalCategory]?.instLabel || 'Institution / Board'}
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder={categoryDefaults[educationalCategory]?.instPlaceholder || 'e.g. CBSE / Delhi University'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
          </div>

          {/* Subjects of Interest */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subjects of Interest (Comma-separated)</label>
            <input
              type="text"
              value={subjectsStr}
              onChange={(e) => setSubjectsStr(e.target.value)}
              placeholder="e.g. Physics, Chemistry, Data Structures"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>

          {/* Language & Pedagogical Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Explanation Language</label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Explanation Teaching Style</label>
              <select
                value={preferredStyle}
                onChange={(e) => setPreferredStyle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
              >
                <option value="intuitive_analogy">Intuitive Real-World Analogies</option>
                <option value="step_by_step">Step-by-Step Problem Solving</option>
                <option value="academic_rigorous">Rigorous Mathematical / Academic Deep Dive</option>
                <option value="visual_conceptual">Visual & Conceptual Graphs</option>
              </select>
            </div>
          </div>

          {/* Daily Study Target */}
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

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
            Create Profile & Start Learning
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 font-semibold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
