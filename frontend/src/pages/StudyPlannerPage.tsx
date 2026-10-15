import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { StudyPlan, StudyPlanTask } from '../types';
import {
  Calendar, CheckCircle2, Circle, Clock, Plus,
  Sparkles, RefreshCw, AlertCircle
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const StudyPlannerPage: React.FC = () => {
  const { profile } = useAuth();

  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [goal, setGoal] = useState('Achieve Mastery in Core Curriculum Topics');
  const [dailyMinutes, setDailyMinutes] = useState(profile?.daily_study_minutes || 60);
  const [subjectsStr, setSubjectsStr] = useState(
    profile?.subjects_of_interest?.join(', ') || 'Physics, Mathematics, Computer Science'
  );
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActivePlan();
  }, []);

  const loadActivePlan = async () => {
    setLoadingPlan(true);
    try {
      const plan = await api.getActiveStudyPlan();
      setActivePlan(plan);
      if (plan) {
        setGoal(plan.goal);
        setDailyMinutes(plan.daily_study_minutes);
        setSubjectsStr(plan.subjects.join(', '));
      }
    } catch (err) {
      console.error('Failed to load plan:', err);
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || loading) return;

    setLoading(true);
    setError(null);
    const subjects = subjectsStr.split(',').map((s) => s.trim()).filter(Boolean);

    try {
      const plan = await api.generateStudyPlan(goal, Number(dailyMinutes), subjects);
      setActivePlan(plan);
    } catch (err: any) {
      setError(err.message || 'Failed to generate study plan.');
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
          tasks: activePlan.tasks.map((t) =>
            t.id === taskId ? { ...t, is_completed: !currentStatus } : t
          ),
        });
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const completedCount = activePlan?.tasks?.filter((t) => t.is_completed).length || 0;
  const totalCount = activePlan?.tasks?.length || 0;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Group tasks by scheduled date
  const groupedTasks: Record<string, StudyPlanTask[]> = {};
  if (activePlan?.tasks) {
    for (const t of activePlan.tasks) {
      const dateKey = t.scheduled_date;
      if (!groupedTasks[dateKey]) groupedTasks[dateKey] = [];
      groupedTasks[dateKey].push(t);
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Adaptive Study Planner</h1>
        <p className="text-xs text-slate-500 mt-1">
          Synthesizes a realistic daily study workload balancing new concepts, weak topic remediation, and active recall.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Plan Configuration Form */}
      <Card className="p-6 md:p-8">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">Learning Target / Exam Goal</label>
              <input
                type="text"
                required
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Master Operating Systems & Discrete Maths for Midterms"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Daily Study Target</label>
                <span className="text-xs font-bold text-teal-600">{dailyMinutes} mins/day</span>
              </div>
              <input
                type="range"
                min={30}
                max={240}
                step={15}
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(Number(e.target.value))}
                className="w-full accent-teal-600 mt-2"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Subjects to Include (Comma-separated)</label>
            <input
              type="text"
              value={subjectsStr}
              onChange={(e) => setSubjectsStr(e.target.value)}
              placeholder="e.g. Physics, Chemistry, Mathematics"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            {activePlan ? 'Regenerate Adaptive Plan' : 'Generate Study Plan'}
          </Button>
        </form>
      </Card>

      {/* Active Plan Tasks View */}
      {loadingPlan ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading active study schedule...</div>
      ) : !activePlan ? (
        <Card className="p-8 text-center text-slate-500 text-xs">
          No active study plan found. Configure your targets above and generate a plan.
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Progress Header */}
          <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Target</span>
              <h2 className="text-base font-bold text-slate-900">{activePlan.goal}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {activePlan.daily_study_minutes} minutes/day • Prioritizing detected knowledge gaps
              </p>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="text-xs font-bold text-teal-600">
                {completedCount} of {totalCount} Tasks Done ({completionPercentage}%)
              </span>
              <div className="w-40 bg-slate-100 rounded-full h-2 mt-1.5 overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Grouped Day Tasks */}
          <div className="space-y-4">
            {Object.entries(groupedTasks).map(([dateStr, tasks], dayIdx) => (
              <Card key={dateStr} className="p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    <h3 className="text-xs font-bold text-slate-900">
                      Day {dayIdx + 1} — {new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {tasks.reduce((sum, t) => sum + t.estimated_minutes, 0)} minutes scheduled
                  </span>
                </div>

                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id, task.is_completed)}
                      className={`flex items-start gap-3.5 p-3 rounded-xl border transition cursor-pointer ${
                        task.is_completed
                          ? 'bg-slate-50/80 border-slate-200/60 opacity-60'
                          : 'bg-white border-slate-200 hover:border-slate-300'
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
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className={`text-xs font-semibold text-slate-900 ${
                              task.is_completed ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {task.title}
                          </span>
                          <Badge
                            variant={
                              task.task_type === 'PRACTICE'
                                ? 'info'
                                : task.task_type === 'REVISION'
                                ? 'warning'
                                : 'purple'
                            }
                          >
                            {task.task_type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{task.description}</p>
                      </div>

                      <span className="text-xs font-mono text-slate-400 shrink-0 font-medium">
                        {task.estimated_minutes} min
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
