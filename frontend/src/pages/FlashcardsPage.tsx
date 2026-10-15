import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Flashcard } from '../types';
import {
  Layers, Plus, RotateCw, CheckCircle2, Clock,
  Sparkles, Award, ArrowRight
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { MathMarkdown } from '../components/common/MathMarkdown';

export const FlashcardsPage: React.FC = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Mode state
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [frontPrompt, setFrontPrompt] = useState('');
  const [backAnswer, setBackAnswer] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [topic, setTopic] = useState('Electromagnetism');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    setLoading(true);
    try {
      const [all, due] = await Promise.all([
        api.getFlashcards(),
        api.getDueFlashcards(),
      ]);
      setFlashcards(all);
      setDueCards(due);
    } catch (err) {
      console.error('Failed to load flashcards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontPrompt.trim() || !backAnswer.trim()) return;

    setCreating(true);
    try {
      await api.createFlashcard({
        front_prompt: frontPrompt,
        back_answer: backAnswer,
        subject,
        topic,
      });
      setFrontPrompt('');
      setBackAnswer('');
      setIsModalOpen(false);
      await loadCards();
    } catch (err) {
      console.error('Failed to create flashcard:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleRateCard = async (rating: number) => {
    const currentCard = dueCards[reviewIndex];
    if (!currentCard) return;

    try {
      await api.reviewFlashcard(currentCard.id, rating);
      setIsFlipped(false);
      if (reviewIndex < dueCards.length - 1) {
        setReviewIndex((prev) => prev + 1);
      } else {
        // Completed review session
        setIsReviewing(false);
        setReviewIndex(0);
        await loadCards();
      }
    } catch (err) {
      console.error('Failed to record review:', err);
    }
  };

  const currentReviewCard = dueCards[reviewIndex];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Smart Flashcards & Spaced Revision</h1>
          <p className="text-xs text-slate-500 mt-1">
            SuperMemo SM-2 spaced repetition scheduler calculating optimal recall intervals based on memory ease factor.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Flashcard
          </Button>
          {dueCards.length > 0 && !isReviewing && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setIsReviewing(true);
                setReviewIndex(0);
                setIsFlipped(false);
              }}
              leftIcon={<RotateCw className="w-4 h-4" />}
            >
              Start Review Session ({dueCards.length})
            </Button>
          )}
        </div>
      </div>

      {/* Review Session Mode */}
      {isReviewing && currentReviewCard ? (
        <div className="max-w-2xl mx-auto space-y-6 py-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Reviewing Card {reviewIndex + 1} of {dueCards.length}
            </span>
            <Button size="sm" variant="ghost" onClick={() => setIsReviewing(false)}>
              Exit Session
            </Button>
          </div>

          {/* Flashcard Flip Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[280px] p-8 rounded-3xl bg-white border border-slate-200 shadow-md cursor-pointer flex flex-col justify-between transition-all hover:shadow-lg text-center"
          >
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
              <span className="uppercase tracking-wider">{currentReviewCard.subject} • {currentReviewCard.topic}</span>
              <Badge variant="purple">SM-2 Spaced Recall</Badge>
            </div>

            <div className="py-8">
              {!isFlipped ? (
                <div>
                  <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider block mb-2">Prompt</span>
                  <h3 className="text-lg font-bold text-slate-900 leading-relaxed">
                    <MathMarkdown content={currentReviewCard.front_prompt} />
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-4 italic">Click card to reveal answer</p>
                </div>
              ) : (
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-2">Answer & Explanation</span>
                  <div className="text-sm text-slate-800 leading-relaxed">
                    <MathMarkdown content={currentReviewCard.back_answer} />
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400">
              Repetitions: {currentReviewCard.repetition_count} • Ease Factor: {currentReviewCard.ease_factor}
            </div>
          </div>

          {/* SM-2 Rating Controls (Revealed after flip) */}
          {isFlipped && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center block">
                How easily did you recall this concept?
              </span>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleRateCard(1)}
                  className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex flex-col items-center"
                >
                  <span>Again</span>
                  <span className="text-[10px] font-normal text-rose-500 mt-0.5">1 day</span>
                </button>
                <button
                  onClick={() => handleRateCard(2)}
                  className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition flex flex-col items-center"
                >
                  <span>Hard</span>
                  <span className="text-[10px] font-normal text-amber-500 mt-0.5">Needs work</span>
                </button>
                <button
                  onClick={() => handleRateCard(3)}
                  className="p-3 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-bold transition flex flex-col items-center"
                >
                  <span>Good</span>
                  <span className="text-[10px] font-normal text-teal-500 mt-0.5">Smooth recall</span>
                </button>
                <button
                  onClick={() => handleRateCard(4)}
                  className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition flex flex-col items-center"
                >
                  <span>Easy</span>
                  <span className="text-[10px] font-normal text-emerald-500 mt-0.5">Flawless</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Regular Flashcard Library Grid */
        <div className="space-y-6">
          {/* Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Due for Review Today</p>
                <h3 className="text-xl font-bold text-slate-900">{dueCards.length} Cards</h3>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Deck Size</p>
                <h3 className="text-xl font-bold text-slate-900">{flashcards.length} Cards</h3>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Mastered (EF ≥ 2.5)</p>
                <h3 className="text-xl font-bold text-slate-900">
                  {flashcards.filter((f) => f.ease_factor >= 2.5 && f.repetition_count > 1).length} Cards
                </h3>
              </div>
            </Card>
          </div>

          {/* Cards List */}
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading flashcard deck...</div>
          ) : flashcards.length === 0 ? (
            <Card className="p-8 text-center text-slate-500 text-xs">
              No flashcards in your deck yet. Click "New Flashcard" to create your first card.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flashcards.map((f) => (
                <Card key={f.id} className="p-5 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {f.subject} • {f.topic}
                      </span>
                      <span className="text-[10px] text-teal-600 font-semibold font-mono">
                        Interval: {f.interval_days}d
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2">{f.front_prompt}</h3>
                    <p className="text-xs text-slate-600 line-clamp-3 mt-1">{f.back_answer}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                    <span>Reviews: {f.repetition_count}</span>
                    <span>Next: {new Date(f.next_review_date).toLocaleDateString()}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Flashcard Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Spaced Revision Flashcard">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Physics"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Topic</label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Electromagnetism"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Front Prompt / Question</label>
            <textarea
              required
              rows={3}
              value={frontPrompt}
              onChange={(e) => setFrontPrompt(e.target.value)}
              placeholder="e.g. State Faraday's Law of Induction and write its formula."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Back Answer / Explanation</label>
            <textarea
              required
              rows={4}
              value={backAnswer}
              onChange={(e) => setBackAnswer(e.target.value)}
              placeholder="e.g. The induced electromotive force in any closed circuit is equal to the negative rate of change of the magnetic flux: emf = - dPhi_B / dt."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={creating}>
              Create Card
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
