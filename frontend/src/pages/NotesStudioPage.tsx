import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { DocumentItem } from '../types';
import {
  FileText, Upload, Trash2, ArrowRight,
  AlertCircle, CheckCircle, Clock, BookOpen, AlertTriangle
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const NotesStudioPage: React.FC = () => {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Physics');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await api.listDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported.');
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      setError('File size must be under 30MB.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const doc = await api.uploadDocument(file, title || undefined, subject || undefined);
      setTitle('');
      await loadDocuments();
      navigate(`/notes/${doc.id}`);
    } catch (err: any) {
      setError(err.message || 'Upload and indexing failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.deleteDocument(docId);
      setDocuments(documents.filter((d) => d.id !== docId));
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Smart Notes Studio</h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload educational PDFs, extract page-indexed chunks, and ask grounded questions with exact source citations.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <Card
        className={`p-8 border-2 border-dashed text-center transition ${
          dragActive ? 'border-teal-500 bg-teal-50/50' : 'border-slate-300 hover:border-slate-400'
        }`}
        onDragOver={(e: React.DragEvent) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e: React.DragEvent) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
          }
        }}
      >
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-sm">
            <Upload className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Upload Educational Notes or Textbook PDF</h3>
            <p className="text-xs text-slate-500 mt-1">Drag and drop your PDF here, or browse from your device</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left max-w-sm mx-auto">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Document Title (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Thermodynamics Ch. 1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Subject</label>
              <input
                type="text"
                placeholder="Physics / Maths / CS"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="inline-block cursor-pointer">
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition">
                {uploading ? 'Extracting & Indexing Pages...' : 'Select PDF File'}
              </span>
            </label>
          </div>
          <p className="text-[11px] text-slate-400">Supported format: PDF up to 30MB • Preserves exact page numbers</p>
        </div>
      </Card>

      {/* Document Library */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Your Uploaded Notes Library</h2>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading documents...</div>
        ) : documents.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 text-xs">
            No documents uploaded yet. Upload your first PDF to enable cited RAG question answering.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <Card
                key={doc.id}
                hoverable
                onClick={() => navigate(`/notes/${doc.id}`)}
                className="p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {doc.status === 'COMPLETED' ? (
                        <Badge variant="success">Indexed</Badge>
                      ) : doc.status === 'PROCESSING' ? (
                        <Badge variant="info">Processing</Badge>
                      ) : (
                        <Badge variant="danger">Failed</Badge>
                      )}
                      <button
                        onClick={(e) => handleDelete(e, doc.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1 truncate" title={doc.title}>
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-2">{doc.subject || 'General'}</p>

                  {doc.error_message && (
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-800 text-[11px] flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{doc.error_message}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{doc.page_count} pages</span>
                  <span>{(doc.file_size_bytes / 1024).toFixed(0)} KB</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
