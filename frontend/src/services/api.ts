import {
  AuthResponse, User, UserProfile, DocumentItem, ChatMessage,
  Quiz, QuizSubmitResult, TopicMastery, LearningStreak,
  Recommendation, ConceptMapData, StudyPlan, StudyPlanTask,
  Flashcard, PersonalMemory, SharedKnowledgeItem, SystemStatus
} from '../types';

const API_BASE = '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('companion_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorDetail = 'An error occurred';
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.detail || errorDetail;
      } catch {
        errorDetail = response.statusText;
      }
      throw new Error(errorDetail);
    }

    return response.json();
  }

  // System & AI status
  async getSystemStatus(): Promise<SystemStatus> {
    return this.request<SystemStatus>('/system/status');
  }

  async configureAI(apiKey: string, provider: string = 'gemini', model?: string): Promise<any> {
    return this.request<any>('/system/configure-ai', {
      method: 'POST',
      body: JSON.stringify({ api_key: apiKey, provider, model }),
    });
  }

  // Auth & Profile
  async register(data: any): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/users/profile');
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return this.request<UserProfile>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Documents & RAG
  async uploadDocument(file: File, title?: string, subject?: string): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (subject) formData.append('subject', subject);

    return this.request<DocumentItem>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async listDocuments(): Promise<DocumentItem[]> {
    return this.request<DocumentItem[]>('/documents');
  }

  async getDocument(id: string): Promise<any> {
    return this.request<any>(`/documents/${id}`);
  }

  async chatWithDocument(id: string, message: string, language?: string): Promise<any> {
    return this.request<any>(`/documents/${id}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, target_language: language }),
    });
  }

  async getDocumentSummary(id: string): Promise<any> {
    return this.request<any>(`/documents/${id}/summary`);
  }

  async deleteDocument(id: string): Promise<void> {
    return this.request<void>(`/documents/${id}`, { method: 'DELETE' });
  }

  // AI Tutor
  async chatTutor(message: string, depth = 'standard', language?: string, conversationId?: string): Promise<any> {
    return this.request<any>('/tutor/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        explanation_depth: depth,
        target_language: language,
        conversation_id: conversationId,
      }),
    });
  }

  async getConversations(): Promise<any[]> {
    return this.request<any[]>('/tutor/conversations');
  }

  async getConversation(id: string): Promise<any> {
    return this.request<any>(`/tutor/conversations/${id}`);
  }

  // Quizzes & Knowledge Tracing
  async generateQuiz(payload: any): Promise<Quiz> {
    return this.request<Quiz>('/quizzes/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getQuiz(id: string): Promise<Quiz> {
    return this.request<Quiz>(`/quizzes/${id}`);
  }

  async submitQuiz(quizId: string, responses: any[], totalTimeSeconds: number): Promise<QuizSubmitResult> {
    return this.request<QuizSubmitResult>(`/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        quiz_id: quizId,
        responses,
        total_time_taken_seconds: totalTimeSeconds,
      }),
    });
  }

  async getQuizHistory(): Promise<any[]> {
    return this.request<any[]>('/quizzes/history/all');
  }

  async getMasteries(): Promise<TopicMastery[]> {
    return this.request<TopicMastery[]>('/learning/mastery');
  }

  async getDKTBenchmark(): Promise<any> {
    return this.request<any>('/learning/dkt-benchmark');
  }

  // Recommendations
  async getRecommendations(): Promise<Recommendation[]> {
    return this.request<Recommendation[]>('/recommendations');
  }

  async getRecommendationEvaluation(): Promise<any> {
    return this.request<any>('/recommendations/evaluation');
  }

  async sendRecommendationFeedback(id: string, isHelpful: boolean, dismiss = false): Promise<any> {
    return this.request<any>('/recommendations/feedback', {
      method: 'POST',
      body: JSON.stringify({ recommendation_id: id, is_helpful: isHelpful, dismiss }),
    });
  }

  // Concept Maps
  async generateConceptMap(subject: string, topic: string, documentId?: string): Promise<ConceptMapData> {
    return this.request<ConceptMapData>('/concept-maps/generate', {
      method: 'POST',
      body: JSON.stringify({ subject, topic, document_id: documentId }),
    });
  }

  // Adaptive Study Planner
  async generateStudyPlan(goal: string, minutes: number, subjects: string[]): Promise<StudyPlan> {
    return this.request<StudyPlan>('/study-plans/generate', {
      method: 'POST',
      body: JSON.stringify({
        goal,
        daily_study_minutes: minutes,
        subjects,
        focus_on_weak_topics: true,
      }),
    });
  }

  async getActiveStudyPlan(): Promise<StudyPlan | null> {
    return this.request<StudyPlan | null>('/study-plans/active');
  }

  async updateTaskStatus(taskId: string, isCompleted: boolean): Promise<StudyPlanTask> {
    return this.request<StudyPlanTask>(`/study-plans/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_completed: isCompleted }),
    });
  }

  // Flashcards & Spaced Revision
  async createFlashcard(payload: any): Promise<Flashcard> {
    return this.request<Flashcard>('/flashcards', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getFlashcards(): Promise<Flashcard[]> {
    return this.request<Flashcard[]>('/flashcards');
  }

  async getDueFlashcards(): Promise<Flashcard[]> {
    return this.request<Flashcard[]>('/flashcards/due');
  }

  async reviewFlashcard(flashcardId: string, rating: number): Promise<any> {
    return this.request<any>('/flashcards/review', {
      method: 'POST',
      body: JSON.stringify({ flashcard_id: flashcardId, rating }),
    });
  }

  // Personal Memory
  async getMemories(): Promise<PersonalMemory[]> {
    return this.request<PersonalMemory[]>('/memory');
  }

  async createMemory(category: string, memoryText: string): Promise<PersonalMemory> {
    return this.request<PersonalMemory>('/memory', {
      method: 'POST',
      body: JSON.stringify({ category, memory_text: memoryText }),
    });
  }

  async deleteMemory(id: string): Promise<void> {
    return this.request<void>(`/memory/${id}`, { method: 'DELETE' });
  }

  async clearAllMemories(): Promise<void> {
    return this.request<void>('/memory/clear/all', { method: 'DELETE' });
  }

  // Shared Verified Knowledge Base
  async getSharedKnowledge(subject?: string, topic?: string): Promise<SharedKnowledgeItem[]> {
    const params = new URLSearchParams();
    if (subject) params.append('subject', subject);
    if (topic) params.append('topic', topic);
    return this.request<SharedKnowledgeItem[]>(`/shared-knowledge?${params.toString()}`);
  }

  async submitKnowledge(payload: any): Promise<SharedKnowledgeItem> {
    return this.request<SharedKnowledgeItem>('/shared-knowledge', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async upvoteKnowledge(id: string): Promise<SharedKnowledgeItem> {
    return this.request<SharedKnowledgeItem>(`/shared-knowledge/${id}/upvote`, {
      method: 'POST',
    });
  }

  // Analytics Dashboard
  async getDashboardAnalytics(): Promise<any> {
    return this.request<any>('/analytics/dashboard');
  }
}

export const api = new ApiClient();
