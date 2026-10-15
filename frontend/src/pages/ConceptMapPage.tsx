import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { ConceptMapData, ConceptNode } from '../types';
import {
  Network, Sparkles, BookOpen, Layers,
  ExternalLink, ZoomIn, ZoomOut, RefreshCw, AlertCircle
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const ConceptMapPage: React.FC = () => {
  const location = useLocation();
  const state = (location.state as any) || {};

  const [subject, setSubject] = useState(state.subject || 'Computer Science');
  const [topic, setTopic] = useState(state.topic || 'Binary Search Trees & Balancing');
  const [documentId, setDocumentId] = useState<string | undefined>(state.documentId);
  const [documents, setDocuments] = useState<any[]>([]);

  const [mapData, setMapData] = useState<ConceptMapData | null>(null);
  const [selectedNode, setSelectedNode] = useState<ConceptNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listDocuments()
      .then(setDocuments)
      .catch((err) => console.error(err));

    handleGenerateMap();
  }, []);

  const handleGenerateMap = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.generateConceptMap(subject, topic, documentId);
      setMapData(data);
      if (data.nodes && data.nodes.length > 0) {
        setSelectedNode(data.nodes[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate concept map.');
    } finally {
      setLoading(false);
    }
  };

  const getNodeColor = (cat: string) => {
    switch (cat) {
      case 'core':
        return 'fill-teal-600 stroke-teal-700 text-white';
      case 'prerequisite':
        return 'fill-amber-500 stroke-amber-600 text-white';
      case 'application':
        return 'fill-primary-600 stroke-primary-700 text-white';
      default:
        return 'fill-slate-600 stroke-slate-700 text-white';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Concept Map Studio</h1>
        <p className="text-xs text-slate-500 mt-1">
          Interactive conceptual graph generator mapping prerequisite foundations, core theories, and practical applications.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Generator Control Card */}
      <Card className="p-4 md:p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerateMap();
          }}
          className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
        >
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Physics"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Quantum Mechanics"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Ground on Uploaded Notes</label>
            <select
              value={documentId || ''}
              onChange={(e) => setDocumentId(e.target.value || undefined)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
            >
              <option value="">None (General Topic)</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Generate Graph
          </Button>
        </form>
      </Card>

      {/* Main Graph & Node Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Graph Canvas */}
        <div className="lg:col-span-2">
          <Card className="p-4 bg-slate-900 border-slate-800 text-white rounded-2xl h-[520px] flex flex-col relative overflow-hidden shadow-lg">
            {/* Graph Legend & Status */}
            <div className="flex items-center justify-between z-10 text-xs pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Prerequisite
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400" /> Core Theory
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-400" /> Practical Application
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Click a node to inspect</span>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs">
                <RefreshCw className="w-8 h-8 animate-spin text-teal-400 mb-2" />
                <span>Extracting concepts and structuring graph...</span>
              </div>
            ) : !mapData || mapData.nodes.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                Enter a topic above to generate an interactive concept map.
              </div>
            ) : (
              <div className="flex-1 relative flex items-center justify-center">
                {/* SVG Graph Canvas */}
                <svg className="w-full h-full" viewBox="0 0 600 400">
                  <defs>
                    <marker
                      id="arrow"
                      viewBox="0 0 10 10"
                      refX="18"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                    </marker>
                  </defs>

                  {/* Edges */}
                  {mapData.edges.map((e, idx) => {
                    const srcIdx = mapData.nodes.findIndex((n) => n.id === e.source);
                    const tgtIdx = mapData.nodes.findIndex((n) => n.id === e.target);
                    if (srcIdx === -1 || tgtIdx === -1) return null;

                    // Compute node positions dynamically in a layout
                    const total = mapData.nodes.length;
                    const srcX = 300 + 200 * Math.cos((srcIdx * 2 * Math.PI) / total);
                    const srcY = 200 + 130 * Math.sin((srcIdx * 2 * Math.PI) / total);
                    const tgtX = 300 + 200 * Math.cos((tgtIdx * 2 * Math.PI) / total);
                    const tgtY = 200 + 130 * Math.sin((tgtIdx * 2 * Math.PI) / total);

                    const midX = (srcX + tgtX) / 2;
                    const midY = (srcY + tgtY) / 2;

                    return (
                      <g key={e.id || idx}>
                        <line
                          x1={srcX}
                          y1={srcY}
                          x2={tgtX}
                          y2={tgtY}
                          stroke="#475569"
                          strokeWidth="2"
                          strokeDasharray={e.is_prerequisite ? '4,4' : undefined}
                          markerEnd="url(#arrow)"
                        />
                        <text
                          x={midX}
                          y={midY - 4}
                          fill="#94a3b8"
                          fontSize="9"
                          textAnchor="middle"
                          className="select-none font-medium"
                        >
                          {e.relationship}
                        </text>
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {mapData.nodes.map((n, idx) => {
                    const total = mapData.nodes.length;
                    const x = 300 + 200 * Math.cos((idx * 2 * Math.PI) / total);
                    const y = 200 + 130 * Math.sin((idx * 2 * Math.PI) / total);
                    const isSelected = selectedNode?.id === n.id;

                    let fill = '#0d9488';
                    if (n.category === 'prerequisite') fill = '#d97706';
                    if (n.category === 'application') fill = '#026fc7';

                    return (
                      <g
                        key={n.id}
                        onClick={() => setSelectedNode(n)}
                        className="cursor-pointer transition-transform duration-150 hover:scale-105"
                      >
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? 26 : 22}
                          fill={fill}
                          stroke={isSelected ? '#ffffff' : '#334155'}
                          strokeWidth={isSelected ? 3 : 1.5}
                          className="shadow-md"
                        />
                        <text
                          x={x}
                          y={y + 36}
                          fill="#f8fafc"
                          fontSize="11"
                          fontWeight="600"
                          textAnchor="middle"
                          className="select-none pointer-events-none"
                        >
                          {n.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </Card>
        </div>

        {/* Right 1 Col: Selected Node Inspector */}
        <div>
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Layers className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">Concept Node Inspector</h3>
            </div>

            {selectedNode ? (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Concept</span>
                    <Badge
                      variant={
                        selectedNode.category === 'prerequisite'
                          ? 'warning'
                          : selectedNode.category === 'application'
                          ? 'info'
                          : 'success'
                      }
                    >
                      {selectedNode.category.toUpperCase()}
                    </Badge>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{selectedNode.label}</h4>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed">
                  {selectedNode.description}
                </div>

                {selectedNode.source_page && (
                  <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100 text-teal-800 font-semibold flex items-center justify-between">
                    <span>Document Reference: Page {selectedNode.source_page}</span>
                    <BookOpen className="w-4 h-4 text-teal-600" />
                  </div>
                )}

                {mapData?.summary && (
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                    <span className="font-bold text-slate-700 block mb-1">Graph Overview:</span>
                    {mapData.summary}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Select any node on the graph to inspect its details and connections.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
