import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  FileText, Bot, ChevronLeft, ChevronRight, Send,
  HelpCircle, Network, BookOpen, ExternalLink, Sparkles, AlertCircle
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { MathMarkdown } from '../components/common/MathMarkdown';

export const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [document, setDocument] = useState<any>(null);
  const [activePage, setActivePage] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'chat' | 'summary'>('chat');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadDocumentDetails(id);
    }
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadDocumentDetails = async (docId: string) => {
    try {
      const doc = await api.getDocument(docId);
      setDocument(doc);
    } catch (err) {
      console.error('Failed to load document details:', err);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading || !id) return;

    const userMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      content: query,
    };
    setChatMessages((prev) => [...prev, userMessage]);
    const currentQuery = query;
    setQuery('');
    setLoading(true);

    try {
      const res = await api.chatWithDocument(id, currentQuery);
      const assistantMessage = {
        id: `a_${Date.now()}`,
        sender: 'assistant',
        content: res.content,
        citations: res.citations || [],
        grounding_type: res.grounding_type,
      };
      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Document QA error:', err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          content: 'Unable to answer query based on document. Please check processing status.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    if (summaryData || !id) return;
    setLoadingSummary(true);
    try {
      const sum = await api.getDocumentSummary(id);
      setSummaryData(sum);
    } catch (err) {
      console.error('Failed to load summary:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const currentPageData = document?.pages?.find((p: any) => p.page_number === activePage);

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col gap-4 max-w-7xl mx-auto overflow-hidden">
      {/* Top Document Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/notes')}>
            ← Back to Notes
          </Button>
          <div>
            <h1 className="text-base font-bold text-slate-900 truncate max-w-md">{document?.title || 'Document'}</h1>
            <p className="text-xs text-slate-500">
              {document?.subject} • {document?.page_count} pages • {(document?.file_size_bytes / 1024).toFixed(0)} KB
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<HelpCircle className="w-4 h-4" />}
            onClick={() =>
              navigate('/quizzes', {
                state: { documentId: document?.id, subject: document?.subject, topic: document?.title },
              })
            }
          >
            Create Quiz from PDF
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Network className="w-4 h-4" />}
            onClick={() =>
              navigate('/concept-maps', {
                state: { documentId: document?.id, subject: document?.subject, topic: document?.title },
              })
            }
          >
            Concept Map
          </Button>
        </div>
      </div>

      {/* Split Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
        {/* Left Pane: Page-Preserving Document Viewer */}
        <div className="bg-white rounded-2xl border border-slate-200/80 flex flex-col overflow-hidden shadow-sm">
          {/* Page Navigator Bar */}
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-bold text-slate-700">Source Document Viewer</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={activePage <= 1}
                onClick={() => setActivePage((prev) => Math.max(1, prev - 1))}
                className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-700">
                Page {activePage} of {document?.page_count || 1}
              </span>
              <button
                disabled={activePage >= (document?.page_count || 1)}
                onClick={() => setActivePage((prev) => Math.min(document?.page_count || 1, prev + 1))}
                className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Page Content View */}
          <div className="flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed text-slate-800 bg-slate-50/20 whitespace-pre-wrap select-text">
            {currentPageData ? (
              currentPageData.text_content ? (
                currentPageData.text_content
              ) : (
                <div className="text-center py-12 text-slate-400 font-sans italic">
                  No text extracted on this page. (Might be an illustration or scanned page)
                </div>
              )
            ) : (
              <div className="text-center py-12 text-slate-400 font-sans">Loading page content...</div>
            )}
          </div>

          {/* Page Footer */}
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex justify-between">
            <span>Character Count: {currentPageData?.char_count || 0}</span>
            <span>1-Indexed Source Attribution</span>
          </div>
        </div>

        {/* Right Pane: AI Chat & Cited Answers */}
        <div className="bg-white rounded-2xl border border-slate-200/80 flex flex-col overflow-hidden shadow-sm">
          {/* Tab Selection */}
          <div className="px-4 pt-3 border-b border-slate-100 flex items-center gap-4 bg-slate-50/60">
            <button
              onClick={() => setActiveTab('chat')}
              className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Grounded Q&A Chat</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('summary');
                loadSummary();
              }}
              className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
                activeTab === 'summary'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Executive Summary & Formulas</span>
            </button>
          </div>

          {activeTab === 'chat' ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Messages Viewport */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                      <Bot className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Ask questions about this document</h3>
                    <p className="text-xs text-slate-500 max-w-xs mb-4">
                      Every answer is strictly grounded in the document and cites the exact source page numbers.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                      <button
                        onClick={() => setQuery('What are the main principles explained in this document?')}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      >
                        "What are the main principles?"
                      </button>
                      <button
                        onClick={() => setQuery('Extract and explain the core mathematical formulas.')}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      >
                        "Explain the core formulas"
                      </button>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-teal-50 border border-teal-200 text-teal-950 font-medium rounded-tr-sm shadow-xs'
                            : 'bg-slate-50 border border-slate-200/80 text-slate-900 rounded-tl-sm'
                        }`}
                      >
                        <MathMarkdown content={msg.content} />

                        {/* Page Citations */}
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-200/60">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                              Source Page Citations:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.citations.map((c: any, cIdx: number) => (
                                <button
                                  key={cIdx}
                                  onClick={() => setActivePage(c.page_number)}
                                  className="text-[11px] px-2 py-0.5 rounded-md bg-teal-100/70 hover:bg-teal-200 text-teal-800 font-semibold flex items-center gap-1 transition"
                                  title={`Jump to Page ${c.page_number}: "${c.excerpt}"`}
                                >
                                  <span>Page {c.page_number}</span>
                                  <ExternalLink className="w-3 h-3 text-teal-600" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-slate-100 bg-white">
                <form onSubmit={handleSendChat} className="flex gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask a question about this PDF (e.g. 'Summarize page 2')..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    disabled={loading}
                  />
                  <Button type="submit" variant="primary" size="sm" disabled={!query.trim() || loading} isLoading={loading}>
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            /* Summary Tab */
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingSummary ? (
                <div className="text-center py-12 text-slate-400 text-xs">Analyzing document and generating summary...</div>
              ) : summaryData ? (
                <div className="space-y-4 text-xs text-slate-700">
                  <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/60">
                    <h3 className="font-bold text-teal-900 mb-1">Executive Summary</h3>
                    <MathMarkdown content={summaryData.summary} />
                  </div>

                  {summaryData.key_concepts && summaryData.key_concepts.length > 0 && (
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2">Key Concepts Covered</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {summaryData.key_concepts.map((c: string, idx: number) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">Click to load document summary.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
