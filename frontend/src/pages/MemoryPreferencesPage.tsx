import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PersonalMemory } from '../types';
import {
  Brain, Plus, Trash2, Shield, Lock,
  Sparkles, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const MemoryPreferencesPage: React.FC = () => {
  const [memories, setMemories] = useState<PersonalMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState('PREFERENCE');
  const [memoryText, setMemoryText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    setLoading(true);
    try {
      const data = await api.getMemories();
      setMemories(data);
    } catch (err) {
      console.error('Failed to load memories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryText.trim() || saving) return;

    setSaving(true);
    try {
      await api.createMemory(category, memoryText);
      setMemoryText('');
      setIsModalOpen(false);
      await loadMemories();
    } catch (err) {
      console.error('Failed to create memory:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteMemory(id);
      setMemories(memories.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Failed to delete memory:', err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete all personal learning memories? This action cannot be undone.')) {
      return;
    }
    try {
      await api.clearAllMemories();
      setMemories([]);
    } catch (err) {
      console.error('Failed to clear memories:', err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Personal Learning Memory</h1>
          <p className="text-xs text-slate-500 mt-1">
            User-governed persistent preferences and learning facts that adapt AI tutor responses specifically to your needs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            className="text-rose-600 border-rose-200 hover:bg-rose-50"
            onClick={handleClearAll}
            disabled={memories.length === 0}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Clear All Memories
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Memory
          </Button>
        </div>
      </div>

      {/* Privacy Guarantee Banner */}
      <Card className="p-4 bg-teal-50/60 border-teal-200/80 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4" />
        </div>
        <div className="text-xs text-slate-700 leading-relaxed">
          <strong className="text-teal-950 font-bold block mb-0.5">Strict User Privacy & Ownership</strong>
          Personal memories are strictly isolated to your account. They are never published into the shared educational knowledge base, nor are they used for external model fine-tuning without explicit authorization. You can edit or purge your memories at any time.
        </div>
      </Card>

      {/* Memories Grid */}
      <div>
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading personal learning memories...</div>
        ) : memories.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 text-xs">
            No personal memories stored yet. Add facts like "I prefer visual examples" or "Targeting GATE 2027" to help the AI tutor tailor explanations.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {memories.map((m) => (
              <Card key={m.id} className="p-5 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Badge variant={m.category === 'GOAL' ? 'purple' : m.category === 'WEAKNESS' ? 'warning' : 'info'}>
                      {m.category}
                    </Badge>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Memory"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">{m.memory_text}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                  <span>Confidence: {Math.round(m.confidence * 100)}%</span>
                  <span>{new Date(m.created_at).toLocaleDateString()}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Memory Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Personal Learning Preference">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
            >
              <option value="PREFERENCE">Learning Preference</option>
              <option value="GOAL">Exam / Learning Goal</option>
              <option value="HABIT">Study Habit</option>
              <option value="WEAKNESS">Known Conceptual Weakness</option>
              <option value="STRENGTH">Topic Strength</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Memory Statement</label>
            <textarea
              required
              rows={3}
              value={memoryText}
              onChange={(e) => setMemoryText(e.target.value)}
              placeholder="e.g. I understand math best when equations are derived step-by-step from first principles."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={saving}>
              Save Memory
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
