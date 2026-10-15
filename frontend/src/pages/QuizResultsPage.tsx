import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Award, CheckCircle2, XCircle, Zap, Flame,
  ArrowRight, RotateCcw, BookOpen, AlertCircle
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { MathMarkdown } from '../components/common/MathMarkdown';
import { QuizSubmitResult, Quiz } from '../types';

export const QuizResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = (location.state as any) || {};
  const result: QuizSubmitResult = state.result;
  const quiz: Quiz = state.quiz;

  useEffect(() => {
    if (result && result.percentage >= 70) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }, [result]);

  if (!result) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p className="text-sm">No quiz result data found.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/quizzes')}>
          Return to Quiz Arena
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Celebration Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-teal-950 text-white rounded-3xl p-6 md:p-8 text-center relative overflow-hidden shadow-lg border border-slate-800">
        <div className="w-16 h-16 rounded-3xl bg-teal-500/20 text-teal-300 flex items-center justify-center mx-auto mb-4 border border-teal-500/30">
          <Award className="w-8 h-8" />
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">Quiz Assessment Completed!</h1>
        <p className="text-slate-300 text-xs md:text-sm max-w-lg mx-auto mb-6">
          {result.recommended_next_step}
        </p>

        {/* Score & Rewards Pill Row */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Score</span>
            <span className="text-xl font-bold text-white">
              {result.score} / {result.total_questions} ({result.percentage}%)
            </span>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center gap-2">
            <Zap className="w-5 h-5 text-teal-300" />
            <div className="text-left">
              <span className="text-[10px] text-teal-300 block font-semibold uppercase">XP Earned</span>
              <span className="text-base font-bold text-white">+{result.xp_earned} XP</span>
            </div>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-300" />
            <div className="text-left">
              <span className="text-[10px] text-amber-300 block font-semibold uppercase">Active Streak</span>
              <span className="text-base font-bold text-white">{result.streak_days} Days</span>
            </div>
          </div>
        </div>

        {/* BKT Knowledge Tracing Update */}
        <div className="mt-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
          <span className="font-semibold text-teal-400">Bayesian Knowledge Tracing:</span>
          <span>New Topic Mastery: {Math.round(result.new_mastery_score * 100)}%</span>
          <Badge variant="info">{result.mastery_status.replace('_', ' ')}</Badge>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-900">Detailed Question Review & Explanations</h2>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/quizzes')}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            New Quiz
          </Button>
          <Button size="sm" variant="primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Question Results Breakdown */}
      <div className="space-y-4">
        {result.question_results.map((q, idx) => (
          <Card key={q.question_id || idx} className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Q{idx + 1}.</span>
                <span className="text-sm font-semibold text-slate-900">{q.question_text}</span>
              </div>
              <Badge variant={q.is_correct ? 'success' : 'danger'}>
                {q.is_correct ? 'Correct' : 'Incorrect'}
              </Badge>
            </div>

            {/* Options review */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {Object.entries(q.options).map(([optKey, optVal]) => {
                const isSelected = q.user_answer === optKey;
                const isCorrect = q.correct_answer === optKey;

                let optClass = 'border-slate-200 bg-white text-slate-700';
                if (isCorrect) {
                  optClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-500';
                } else if (isSelected && !isCorrect) {
                  optClass = 'border-rose-400 bg-rose-50 text-rose-900 font-semibold';
                }

                return (
                  <div key={optKey} className={`p-3 rounded-xl border flex items-center gap-2.5 ${optClass}`}>
                    <span className="font-bold shrink-0">{optKey}:</span>
                    <span>{optVal}</span>
                    {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto shrink-0" />}
                    {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-600 ml-auto shrink-0" />}
                  </div>
                );
              })}
            </div>

            {/* Explanation */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 space-y-1">
              <span className="font-bold text-slate-900 block">Explanation:</span>
              <MathMarkdown content={q.explanation} />
              {q.source_page && (
                <div className="text-[11px] text-teal-700 font-semibold pt-1">
                  Source Reference: Document Page {q.source_page}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
