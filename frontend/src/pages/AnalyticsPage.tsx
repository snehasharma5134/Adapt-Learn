import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TopicMastery } from '../types';
import {
  BarChart3, Brain, Zap, Award, CheckCircle2,
  AlertTriangle, RefreshCw, Layers
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const AnalyticsPage: React.FC = () => {
  const [masteries, setMasteries] = useState<TopicMastery[]>([]);
  const [dktBenchmark, setDktBenchmark] = useState<any>(null);
  const [recEval, setRecEval] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [mList, dktData, recData] = await Promise.all([
        api.getMasteries(),
        api.getDKTBenchmark().catch(() => null),
        api.getRecommendationEvaluation().catch(() => null),
      ]);
      setMasteries(mList);
      setDktBenchmark(dktData);
      setRecEval(recData);
    } catch (err) {
      console.error('Failed to load knowledge analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (confidence: string, score: number) => {
    if (confidence === 'insufficient_data') {
      return <Badge variant="slate">Not Enough Evidence Yet</Badge>;
    }
    if (score >= 0.75) {
      return <Badge variant="success">Strong Understanding</Badge>;
    }
    if (score >= 0.50) {
      return <Badge variant="info">Improving</Badge>;
    }
    return <Badge variant="danger">Needs More Practice</Badge>;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Knowledge Gap Detector & Tracing</h1>
          <p className="text-xs text-slate-500 mt-1">
            Topic-level mastery estimation powered by Bayesian Knowledge Tracing (BKT) and sequential neural tracing.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={loadAnalytics} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Refresh Analytics
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-700">Tracked Topics</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900">{masteries.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Skills dynamically tracked via quiz responses</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-700">Mastered (≥75%)</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {masteries.filter((m) => m.mastery_score >= 0.75).length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Demonstrated consistent conceptual recall</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-700">Knowledge Gaps (&lt;50%)</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {masteries.filter((m) => m.mastery_score < 0.50 && m.attempts_count > 0).length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Prioritized for targeted active practice</p>
        </Card>
      </div>

      {/* Topic Mastery Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Topic-Level Mastery Breakdown</h2>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Computing Bayesian parameters...</div>
        ) : masteries.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 text-xs">
            No topic masteries recorded yet. Take your first quiz in the Smart Quiz Arena to begin tracing.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {masteries.map((m) => (
              <Card key={m.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {m.subject}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 truncate max-w-[200px]" title={m.topic}>
                      {m.topic}
                    </h3>
                  </div>
                  {getStatusBadge(m.confidence_level, m.mastery_score)}
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold mb-1">
                    <span className="text-slate-500">Mastery Probability P(L)</span>
                    <span className="text-teal-700 font-bold">{Math.round(m.mastery_score * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.round(m.mastery_score * 100)}%` }}
                    />
                  </div>
                </div>

                {/* BKT Parameters */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-3 text-center text-[10px] text-slate-500">
                  <div>
                    <span className="block font-bold text-slate-700">{m.attempts_count}</span>
                    <span>Attempts</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-700">{m.p_transit}</span>
                    <span>P(Transit)</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-700">{m.p_slip}</span>
                    <span>P(Slip)</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Model Benchmark & Research Documentation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Knowledge Tracing Benchmark Evaluation */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">Knowledge Tracing Evaluation Benchmark</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Evaluation metrics computed on sequential student response traces using standard ROC-AUC, Accuracy, and RMSE.
          </p>

          {dktBenchmark ? (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">ROC-AUC</span>
                  <span className="text-lg font-bold text-slate-900">{dktBenchmark.metrics.roc_auc}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Accuracy</span>
                  <span className="text-lg font-bold text-slate-900">
                    {Math.round(dktBenchmark.metrics.accuracy * 100)}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">RMSE</span>
                  <span className="text-lg font-bold text-slate-900">{dktBenchmark.metrics.rmse}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 italic text-center">
                {dktBenchmark.model_type} • {dktBenchmark.status}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Loading benchmark evaluation metrics...</p>
          )}
        </Card>

        {/* Recommendation Engine Comparative Evaluation */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Recommendation Strategy Evaluation</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Comparison between baseline popularity models, static rule-based sequencing, and the deployed hybrid BKT priority engine.
          </p>

          {recEval && recEval.comparison ? (
            <div className="space-y-2 pt-2">
              {recEval.comparison.map((c: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs space-y-1">
                  <div className="flex justify-between items-center font-bold text-slate-900">
                    <span>{c.strategy}</span>
                    <span className="text-teal-700">Gap Coverage: {c.learning_gap_coverage}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between">
                    <span>Penalty: {c.repetition_penalty}</span>
                    <span>Cold-start: {c.cold_start_handling}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Loading recommendation evaluations...</p>
          )}
        </Card>
      </div>
    </div>
  );
};
