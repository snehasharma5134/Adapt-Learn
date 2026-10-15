import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SharedKnowledgeItem } from '../types';
import {
  Globe2, Plus, ThumbsUp, CheckCircle, Clock,
  BookOpen, Search, Sparkles, ShieldCheck
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { MathMarkdown } from '../components/common/MathMarkdown';

export const SharedKnowledgePage: React.FC = () => {
  const [entries, setEntries] = useState<SharedKnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Submission state
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [topic, setTopic] = useState('Special Relativity');
  const [level, setLevel] = useState('Undergraduate');
  const [content, setContent] = useState('');
  const [sourceRef, setSourceRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  useEffect(() => {
    loadEntries();
  }, [subjectFilter]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = await api.getSharedKnowledge(subjectFilter || undefined);
      setEntries(data);
    } catch (err) {
      console.error('Failed to load shared knowledge:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (id: string) => {
    try {
      const updated = await api.upvoteKnowledge(id);
      setEntries(entries.map((e) => (e.id === id ? { ...e, upvotes: updated.upvotes } : e)));
    } catch (err) {
      console.error('Failed to upvote entry:', err);
    }
  };

  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || submitting) return;

    setSubmitting(true);
    try {
      await api.submitKnowledge({
        subject,
        topic,
        educational_level: level,
        title,
        content,
        source_reference: sourceRef || undefined,
      });
      setTitle('');
      setContent('');
      setSourceRef('');
      setSubmissionSuccess(true);
      setTimeout(() => {
        setSubmissionSuccess(false);
        setIsModalOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to submit knowledge:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shared Verified Knowledge Base</h1>
          <p className="text-xs text-slate-500 mt-1">
            Carefully curated educational knowledge repository with provenance tracking, peer review, and verification.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Contribute Insight
        </Button>
      </div>

      {/* Moderation Guarantee Card */}
      <Card className="p-4 bg-teal-50/60 border-teal-200/80 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="text-xs text-slate-700 leading-relaxed">
          <strong className="text-teal-950 font-bold block mb-0.5">Academic Moderation Pipeline</strong>
          To prevent hallucination spread and preserve high learning quality, all public contributions undergo peer and automated verification before entering the shared repository. Private notes and conversations are never published here.
        </div>
      </Card>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            placeholder="Filter by subject (e.g. Physics)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
          />
        </div>
      </div>

      {/* Verified Entries List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading verified entries...</div>
        ) : entries.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 text-xs">
            No verified knowledge entries found for this query. Click "Contribute Insight" to submit the first explanation.
          </Card>
        ) : (
          entries.map((item) => (
            <Card key={item.id} className="p-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="success">Verified Knowledge</Badge>
                  <span className="text-xs font-semibold text-slate-400">
                    {item.subject} • {item.topic} ({item.educational_level})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span>Reviewed by {item.reviewed_by || 'Academic Moderator'}</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900">{item.title}</h3>

              <div className="text-xs text-slate-700 leading-relaxed">
                <MathMarkdown content={item.content} />
              </div>

              {item.source_reference && (
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                  <span>Source / Provenance: {item.source_reference}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleUpvote(item.id)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 transition font-semibold"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-teal-600" />
                  <span>Helpful ({item.upvotes})</span>
                </button>
                <span className="text-[11px] text-slate-400">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Contribute Knowledge Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit Educational Knowledge for Review">
        {submissionSuccess ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Submission Received!</h4>
            <p className="text-xs text-slate-600">
              Your explanation has entered the academic review queue and will be published once verified.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitEntry} className="space-y-4">
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
                  placeholder="Special Relativity"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Title of Insight</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Relativistic Time Dilation in Atmospheric Muons"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Verified Explanation / Derivation</label>
              <textarea
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Provide a clear, factually accurate explanation with formulas in KaTeX ($...$). Minimum 20 characters."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Academic Reference / Textbook Source</label>
              <input
                type="text"
                value={sourceRef}
                onChange={(e) => setSourceRef(e.target.value)}
                placeholder="e.g. Resnick & Halliday, Ch. 37"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
                Submit to Review Queue
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
