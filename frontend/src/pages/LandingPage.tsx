import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Bot, Sparkles, FileText, CheckCircle2,
  Award, Globe2, ArrowRight, ShieldCheck, Zap
} from 'lucide-react';
import { Button } from '../components/common/Button';

export const LandingPage: React.FC = () => {
  const levels = [
    { title: 'School Education', desc: 'Primary, Secondary & Senior Secondary (CBSE, ICSE, State Boards)', icon: '🎒' },
    { title: 'College & University', desc: 'Engineering, BCA, Science, Commerce, Arts, Postgraduate & Ph.D.', icon: '🎓' },
    { title: 'Competitive Exams', desc: 'JEE, NEET, UPSC, GATE, CAT, State PSCs & Entrance Assessments', icon: '🎯' },
    { title: 'Independent Learners', desc: 'Self-paced mastery in Programming, Mathematics, AI & General Skills', icon: '💡' },
  ];

  const features = [
    {
      title: 'Smart Notes Studio (RAG)',
      desc: 'Upload educational PDFs. Ask deep questions and receive grounded explanations with exact source page citations.',
      icon: FileText,
      color: 'text-teal-600 bg-teal-50',
    },
    {
      title: 'Multilingual General AI Tutor',
      desc: 'Learn complex concepts in English, Hindi, Bengali, Marathi, Tamil, Telugu and more with adaptive depth controls.',
      icon: Bot,
      color: 'text-primary-600 bg-primary-50',
    },
    {
      title: 'Smart Quiz Arena & Duplicate Prevention',
      desc: 'Generate syllabus-aligned MCQs on demand from notes or topics with structural validation and cryptographic duplicate prevention.',
      icon: Award,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      title: 'Bayesian Knowledge Gap Detector',
      desc: 'Estimates topic-level mastery using Bayesian Knowledge Tracing (BKT) to uncover exact learning gaps instead of generic percentages.',
      icon: Zap,
      color: 'text-violet-600 bg-violet-50',
    },
    {
      title: 'Adaptive Study Planner & Concept Maps',
      desc: 'Personalized multi-day schedules balancing weak topics, new concepts, and interactive visual concept relationship graphs.',
      icon: Sparkles,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Personal Memory & Shared Knowledge',
      desc: 'User-governed personal learning preferences combined with a curated, peer-moderated educational knowledge repository.',
      icon: Globe2,
      color: 'text-blue-600 bg-blue-50',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white font-sans">
      {/* Top Navigation */}
      <nav className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-primary-600 flex items-center justify-center text-white shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight block">AI Learning Companion</span>
            <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">UN SDG 4 Quality Education</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-700 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-teal-500" />
          <span>Multilevel, Multilingual AI-Powered Education Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
          Learn Smarter. <span className="text-teal-600">Understand Better.</span> Grow Together.
        </h1>

        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          Upload your notes or learn directly from AI. Understand difficult concepts, practice through intelligent quizzes,
          identify topic-level knowledge gaps, and follow an adaptive learning journey—across all educational stages.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/register">
            <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Start Learning Free
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline">
              Log In to Portal
            </Button>
          </Link>
        </div>

        {/* SDG 4 Quality Education Trust Banner */}
        <div className="mt-14 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 font-bold shrink-0">
              SDG 4
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">United Nations Sustainable Development Goal 4</p>
              <p className="text-xs text-slate-500">Committed to equitable, accessible, high-quality education for all learners.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 shrink-0">
            <ShieldCheck className="w-4 h-4" />
            <span>Inclusive & Free</span>
          </div>
        </div>
      </section>

      {/* Target Audiences Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Tailored to Every Educational Stage</h2>
          <p className="text-slate-600 text-sm mt-2">The system adapts explanations and assessments to your selected stage and verified progress.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {levels.map((lvl, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <span className="text-3xl block mb-4">{lvl.icon}</span>
              <h3 className="font-bold text-slate-900 text-base mb-2">{lvl.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{lvl.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Key Feature Modules */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Comprehensive Educational Architecture</h2>
          <p className="text-slate-600 text-sm mt-2">Built with real RAG page citations, Bayesian Knowledge Tracing, and spaced revision.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${f.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{f.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-slate-900 text-white py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Empower Your Learning Journey Today</h2>
          <p className="text-slate-400 text-sm mb-8">
            Experience citation-backed notes analysis, personalized study planning, and real-time knowledge tracing.
          </p>
          <Link to="/register">
            <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="h-16 max-w-7xl mx-auto px-6 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200">
        <span>© 2026 AI Learning Companion. UN SDG Goal 4.</span>
        <span>Built for Learners Everywhere.</span>
      </footer>
    </div>
  );
};
