import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import {
  Flame, Zap, BookOpen, Bot, FileText,
  HelpCircle, ArrowRight, CheckCircle2, Circle,
  TrendingUp, Sparkles, Award
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [analyticsData, recsData, planData] = await Promise.all([
        api.getDashboardAnalytics(),
        api.getRecommendations(),
        api.getActiveStudyPlan().catch(() => null),
      ]);
      setAnalytics(analyticsData);
      setRecommendations(recsData);
      setActivePlan(planData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      await api.updateTaskStatus(taskId, !currentStatus);
      if (activePlan) {
        setActivePlan({
          ...activePlan,
          tasks: activePlan.tasks.map((t: any) =>
            t.id === taskId ? { ...t, is_completed: !currentStatus } : t
          ),
        });
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const chartData = (analytics?.topic_masteries || []).map((m: any) => ({
    topic: m.topic.length > 14 ? m.topic.slice(0, 12) + '...' : m.topic,
    mastery: Math.round(m.mastery_score * 100),
    attempts: m.attempts_count,
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-teal-950 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-lg border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalized Multilevel Journey</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
            Welcome back, {profile?.display_name || 'Learner'}!
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-6 font-normal">
            Your learning companion is configured for{' '}
            <strong className="text-white font-semibold">{profile?.current_level}</strong> with explanations in{' '}
            <strong className="text-teal-300 font-semibold">{profile?.preferred_language}</strong>.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/tutor')}
              leftIcon={<Bot className="w-4 h-4" />}
            >
              Ask AI Tutor
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/quizzes')}
              leftIcon={<HelpCircle className="w-4 h-4" />}
            >
              Take Smart Quiz
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/notes')}
              leftIcon={<FileText className="w-4 h-4" />}
            >
              Upload Notes PDF
            </Button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Daily Streak</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {analytics?.streak?.current_streak || 1} <span className="text-xs font-normal text-slate-500">days</span>
            </h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 fill-violet-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Learning XP</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {analytics?.streak?.total_xp || 50} <span className="text-xs font-normal text-slate-500">XP</span>
            </h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Quizzes Completed</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {analytics?.total_quizzes_taken || 0}
            </h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Average Score</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {analytics?.average_quiz_score || 0}%
            </h3>
          </div>
        </Card>
      </div>

      {/* Main Grid: Recommendations & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personalized Recommendation Engine (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-teal-600" />
              <h2 className="text-lg font-bold text-slate-900">Recommended Next Steps</h2>
            </div>
            <Link to="/analytics" className="text-xs font-semibold text-teal-600 hover:underline">
              View Knowledge Tracing →
            </Link>
          </div>

          <div className="space-y-3">
            {recommendations.length === 0 ? (
              <Card className="p-6 text-center text-slate-500 text-sm">
                No active recommendations right now. Take a quiz or study notes to generate personalized insights!
              </Card>
            ) : (
              recommendations.map((rec) => (
                <Card key={rec.id} className="p-5 flex items-start justify-between gap-4 hoverable">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          rec.recommendation_type === 'WEAK_TOPIC'
                            ? 'danger'
                            : rec.recommendation_type === 'REVISION_DUE'
                            ? 'warning'
                            : 'info'
                        }
                      >
                        {rec.recommendation_type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-slate-400 font-medium">{rec.subject}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{rec.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{rec.reason}</p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => {
                      if (rec.action_type === 'QUIZ') navigate('/quizzes');
                      else if (rec.action_type === 'FLASHCARD') navigate('/flashcards');
                      else navigate('/tutor');
                    }}
                  >
                    Start Practice
                  </Button>
                </Card>
              ))
            )}
          </div>

          {/* Visual Analytics Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Topic Mastery (Bayesian Knowledge Tracing)</h3>
                <p className="text-xs text-slate-500">Estimated probability of concept mastery derived from quiz performance</p>
              </div>
              <Link to="/analytics" className="text-xs font-semibold text-teal-600 hover:underline">
                Model Details
              </Link>
            </div>

            {chartData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
                <p>No topic mastery data recorded yet.</p>
                <Button size="sm" variant="outline" className="mt-3" onClick={() => navigate('/quizzes')}>
                  Take your first quiz to measure mastery
                </Button>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="topic" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Mastery Score']}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                    />
                    <Bar dataKey="mastery" fill="#0d9488" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Adaptive Study Planner & Streaks (1 col) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Today's Study Plan</h2>
            <Link to="/study-planner" className="text-xs font-semibold text-teal-600 hover:underline">
              Full Schedule →
            </Link>
          </div>

          <Card className="p-5 space-y-4">
            {activePlan && activePlan.tasks && activePlan.tasks.length > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-100 pb-2">
                  <span className="font-semibold text-slate-800">{activePlan.goal}</span>
                  <span>{activePlan.daily_study_minutes} mins/day</span>
                </div>
                {activePlan.tasks.slice(0, 4).map((task: any) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id, task.is_completed)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl transition cursor-pointer ${
                      task.is_completed ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <button className="mt-0.5 text-teal-600 shrink-0">
                      {task.is_completed ? (
                        <CheckCircle2 className="w-5 h-5 fill-teal-500 text-white" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-semibold text-slate-800 truncate ${
                          task.is_completed ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                        <span>{task.estimated_minutes} min</span>
                        <span>•</span>
                        <span className="text-teal-600 uppercase font-semibold">{task.task_type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-500 mb-3">No active study plan generated yet.</p>
                <Button size="sm" variant="primary" onClick={() => navigate('/study-planner')}>
                  Generate Adaptive Plan
                </Button>
              </div>
            )}
          </Card>

          {/* Quick Shortcuts */}
          <Card className="p-5 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Study Modules</h3>
            <Link
              to="/concept-maps"
              className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <span>Concept Map Studio</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link
              to="/flashcards"
              className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <span>Spaced Revision Flashcards</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link
              to="/shared-knowledge"
              className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <span>Verified Shared Knowledge</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};
