import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Quiz } from '../types';
import {
  Clock, ArrowLeft, ArrowRight, CheckCircle2,
  AlertCircle, ShieldCheck
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { MathMarkdown } from '../components/common/MathMarkdown';

export const QuizTakePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadQuiz(id);
    }
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadQuiz = async (quizId: string) => {
    setLoading(true);
    try {
      const q = await api.getQuiz(quizId);
      setQuiz(q);
    } catch (err) {
      console.error('Failed to load quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionKey: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionKey,
    });
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);

    const responses = quiz.questions.map((q) => ({
      question_id: q.id,
      selected_option: selectedAnswers[q.id] || 'A',
      time_spent_seconds: Math.round(timeSpent / quiz.questions.length),
    }));

    try {
      const result = await api.submitQuiz(quiz.id, responses, timeSpent);
      navigate(`/quizzes/results/${quiz.id}`, { state: { result, quiz } });
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      alert('Error submitting quiz answers.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !quiz) {
    return <div className="text-center py-20 text-slate-400 text-xs">Preparing assessment session...</div>;
  }

  const currentQ = quiz.questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round(((currentIndex + 1) / quiz.questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Quiz Top Bar */}
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 truncate max-w-sm">{quiz.title}</h2>
          <p className="text-xs text-slate-500">
            {quiz.subject} • {quiz.difficulty.toUpperCase()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={handleSubmit}
            isLoading={submitting}
            disabled={submitting}
          >
            Submit Quiz
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-200 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-teal-500 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Card */}
      <Card className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 border-b border-slate-100 pb-3">
          <span>
            Question {currentIndex + 1} of {quiz.questions.length}
          </span>
          <span>
            {answeredCount}/{quiz.questions.length} Answered
          </span>
        </div>

        {/* Question Text */}
        <div className="text-base font-medium text-slate-900 leading-relaxed">
          <MathMarkdown content={currentQ.question_text} />
        </div>

        {/* 4 MCQ Options */}
        <div className="space-y-3 pt-2">
          {Object.entries(currentQ.options).map(([optKey, optVal]) => {
            const isSelected = selectedAnswers[currentQ.id] === optKey;
            return (
              <button
                key={optKey}
                type="button"
                onClick={() => handleSelectOption(currentQ.id, optKey)}
                className={`w-full text-left p-4 rounded-xl border text-xs md:text-sm font-medium transition flex items-start gap-3.5 ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50/70 text-teal-900 ring-1 ring-teal-500'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {optKey}
                </span>
                <span className="flex-1 pt-0.5 leading-relaxed">{optVal}</span>
              </button>
            );
          })}
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <Button
            size="sm"
            variant="outline"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          {currentIndex < quiz.questions.length - 1 ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next Question
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              onClick={handleSubmit}
              isLoading={submitting}
              rightIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Finish & Grade
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
