import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import {
  Bot, Send, Plus, Sparkles, MessageSquare,
  Globe, HelpCircle, Layers, Lightbulb, Trash2
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { MathMarkdown } from '../components/common/MathMarkdown';

export const AITutorPage: React.FC = () => {
  const { profile } = useAuth();

  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [depth, setDepth] = useState<string>('standard');
  const [language, setLanguage] = useState<string>(profile?.preferred_language || 'English');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    'Explain Newton’s Laws of Motion with real-world sports examples.',
    'How does recursion work in programming? Teach me using a Russian doll analogy.',
    'What is the fundamental difference between TCP and UDP?',
    'Give me a practice problem in basic integration with step-by-step hints.'
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (profile?.preferred_language) {
      setLanguage(profile.preferred_language);
    }
  }, [profile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const convs = await api.getConversations();
      setConversations(convs);
      if (convs.length > 0 && !currentConversationId) {
        selectConversation(convs[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const selectConversation = async (convId: string) => {
    setCurrentConversationId(convId);
    try {
      const conv = await api.getConversation(convId);
      setMessages(conv.messages || []);
    } catch (err) {
      console.error('Failed to load conversation details:', err);
    }
  };

  const handleStartNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg = {
      id: `temp_${Date.now()}`,
      sender: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await api.chatTutor(text, depth, language, currentConversationId || undefined);
      setCurrentConversationId(res.conversation_id);

      const assistantMsg = {
        id: res.message_id,
        sender: 'assistant',
        content: res.content,
        citations: res.citations || [],
        created_at: res.created_at,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (res.follow_up_suggestions) {
        setSuggestions(res.follow_up_suggestions);
      }
      loadConversations();
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          content: 'Sorry, I encountered an error while processing your request. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-4 max-w-7xl mx-auto overflow-hidden">
      {/* Sidebar: Conversation History */}
      <div className="hidden md:flex flex-col w-64 bg-white rounded-2xl border border-slate-200/80 p-4 shrink-0 shadow-sm">
        <Button
          variant="primary"
          size="sm"
          onClick={handleStartNewChat}
          className="w-full mb-4"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Conversation
        </Button>

        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">History</div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {conversations.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No past conversations.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => selectConversation(c.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 truncate transition ${
                  currentConversationId === c.id
                    ? 'bg-teal-50 text-teal-800 font-semibold border border-teal-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{c.title}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Chat Control Header */}
        <div className="px-6 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Multilingual General AI Tutor</h2>
              <p className="text-[11px] text-slate-500">Adapts to {profile?.current_level}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Depth controls */}
            <select
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="simpler">Simpler Analogy</option>
              <option value="standard">Standard Explanation</option>
              <option value="step_by_step">Step-by-Step</option>
              <option value="detailed">Academic Deep Dive</option>
              <option value="practice_question">Practice Problem</option>
            </select>

            {/* Language toggle */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
              <option value="Bengali">Bengali (বাংলা)</option>
              <option value="Marathi">Marathi (मराठी)</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="Gujarati">Gujarati (ગુજરાતી)</option>
              <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
              <option value="Malayalam">Malayalam (മലയാളം)</option>
              <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
              <option value="Odia">Odia (ଓଡ଼ିଆ)</option>
            </select>
          </div>
        </div>

        {/* Message Viewport */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-lg mx-auto text-center py-8">
              <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">What would you like to learn today?</h3>
              <p className="text-xs text-slate-500 mb-6">
                Ask any educational question. I can teach concepts, derive formulas, provide everyday analogies, or quiz your understanding.
              </p>

              <div className="w-full space-y-2 text-left">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Suggested Prompts
                </span>
                {suggestions.slice(0, 3).map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(s)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-700 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-900 transition flex items-center justify-between group"
                  >
                    <span>{s}</span>
                    <span className="text-teal-500 opacity-0 group-hover:opacity-100 transition">→</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div
                key={m.id || idx}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-teal-50 border border-teal-200 text-teal-950 font-medium rounded-tr-sm shadow-xs'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-900 rounded-tl-sm shadow-sm'
                  }`}
                >
                  <MathMarkdown content={m.content} />
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex gap-3 items-center text-slate-400 text-xs italic">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs font-medium ml-1">AI Tutor is formulating explanation in {language}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Follow-up Suggestions Bar */}
        {suggestions.length > 0 && messages.length > 0 && (
          <div className="px-6 py-2 border-t border-slate-100 bg-slate-50/40 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Quick follow-ups:</span>
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s)}
                className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-teal-700 hover:border-teal-300 transition shrink-0"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask in ${language} (e.g. "Explain the difference between mitosis and meiosis")...`}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              disabled={loading}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!inputText.trim() || loading}
              isLoading={loading}
              className="px-5 py-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
