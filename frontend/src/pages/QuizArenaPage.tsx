import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import {
  HelpCircle, Clock, Award, Play, History,
  BookOpen, Sparkles, AlertCircle, CheckCircle
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const QuizArenaPage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state as any) || {};

  const [subject, setSubject] = useState(state.subject || 'Computer Science');
  const [topic, setTopic] = useState(state.topic || 'Data Structures & Algorithms');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [mode, setMode] = useState<'PRACTICE' | 'TIMED'>('PRACTICE');
  const [timeLimit, setTimeLimit] = useState(300);
  const [documentId, setDocumentId] = useState<string | undefined>(state.documentId);
  const [documents, setDocuments] = useState<any[]>([]);

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingHistory(true);
    try {
      const [hist, docs] = await Promise.all([
        api.getQuizHistory().catch(() => []),
        api.listDocuments().catch(() => []),
      ]);
      setHistory(hist);
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load quiz arena data:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || loading) return;

    setError(null);
    setLoading(true);

    try {
      const quiz = await api.generateQuiz({
        subject,
        topic,
        educational_level: profile?.current_level || 'Undergraduate',
        difficulty,
        question_count: Number(questionCount),
        mode,
        time_limit_seconds: mode === 'TIMED' ? timeLimit : 0,
        document_id: documentId || null,
      });

      navigate(`/quizzes/take/${quiz.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Smart Quiz Arena</h1>
        <p className="text-xs text-slate-500 mt-1">
          Generate syllabus-aligned MCQs with structural validation and cryptographic duplicate prevention.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Quiz Generator Form */}
        <div className="lg:col-span-2">
          <Card className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Create Assessment Challenge</h2>
                <p className="text-xs text-slate-500">Generate fresh questions from topics or uploaded notes</p>
              </div>
            </div>

            <form onSubmit={handleGenerateQuiz} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Physics, Chemistry, CS"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Topic / Chapter</label>
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Recursion, Thermodynamics, Optics"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Document Link (Optional) */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Ground on Uploaded Notes (Optional)
                </label>
                <select
                  value={documentId || ''}
                  onChange={(e) => setDocumentId(e.target.value || undefined)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                >
                  <option value="">No document (Direct topic generation)</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title} ({d.page_count} pages)
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty & Question Count */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                  >
                    <option value="easy">Easy (Foundations)</option>
                    <option value="medium">Medium (Standard)</option>
                    <option value="hard">Hard (Advanced Rigor)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Number of Questions</label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                  >
                    <option value={3}>3 Questions (Quick Check)</option>
                    <option value={5}>5 Questions (Standard)</option>
                    <option value={10}>10 Questions (Assessment)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Assessment Mode</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                  >
                    <option value="PRACTICE">Practice (No Timer)</option>
                    <option value="TIMED">Timed Assessment</option>
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={loading}
                leftIcon={<Play className="w-4 h-4 fill-white" />}
              >
                {loading ? 'Validating & Generating Questions...' : 'Generate and Start Quiz'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right 1 Col: Past Attempts History */}
        <div>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900">Recent Quiz Attempts</h3>
            </div>

            {loadingHistory ? (
              <p className="text-xs text-slate-400">Loading history...</p>
            ) : history.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No quiz attempts recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 5).map((att) => (
                  <div key={att.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]">
                        {att.topic}
                      </span>
                      <Badge variant={att.percentage >= 80 ? 'success' : att.percentage >= 50 ? 'warning' : 'danger'}>
                        {att.percentage}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>{att.score}/{att.total_questions} correct</span>
                      <span>{new Date(att.completed_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
