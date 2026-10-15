export interface UserProfile {
  display_name: string;
  educational_category: string;
  current_level: string;
  institution_or_board?: string;
  stream?: string;
  subjects_of_interest: string[];
  preferred_language: string;
  preferred_style: string;
  learning_goals?: string;
  daily_study_minutes: number;
  target_exam_date?: string;
}

export interface User {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
  profile?: UserProfile;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  display_name: string;
  educational_level: string;
  preferred_language: string;
}

export interface CitationItem {
  document_id: string;
  document_title: string;
  page_number: number;
  excerpt: string;
}

export interface DocumentItem {
  id: string;
  user_id: string;
  title: string;
  original_filename: string;
  file_size_bytes: number;
  page_count: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  error_message?: string;
  subject?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  citations?: CitationItem[];
  created_at?: string;
}

export interface QuizQuestion {
  id: string;
  question_order: number;
  question_text: string;
  options: { [key: string]: string };
  source_page?: number;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  topic: string;
  educational_level: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_count: number;
  mode: 'PRACTICE' | 'TIMED';
  time_limit_seconds: number;
  document_id?: string;
  created_at: string;
  questions: QuizQuestion[];
}

export interface QuestionResultItem {
  question_id: string;
  question_text: string;
  options: { [key: string]: string };
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
  source_page?: number;
}

export interface QuizSubmitResult {
  attempt_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  xp_earned: number;
  streak_days: number;
  new_mastery_score: number;
  mastery_status: string;
  question_results: QuestionResultItem[];
  recommended_next_step: string;
}

export interface TopicMastery {
  id: string;
  subject: string;
  topic: string;
  mastery_score: number;
  confidence_level: 'strong' | 'improving' | 'needs_practice' | 'insufficient_data';
  attempts_count: number;
  correct_count: number;
  p_transit: number;
  p_guess: number;
  p_slip: number;
  last_practiced_at: string;
}

export interface LearningStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  total_xp: number;
}

export interface AchievementItem {
  code: string;
  title: string;
  description: string;
  badge_icon: string;
  xp_value: number;
  is_earned: boolean;
  earned_at?: string;
}

export interface Recommendation {
  id: string;
  recommendation_type: string;
  title: string;
  reason: string;
  priority_score: number;
  subject?: string;
  topic?: string;
  action_type: string;
  action_payload: any;
  is_completed: boolean;
  is_dismissed: boolean;
  created_at: string;
}

export interface ConceptNode {
  id: string;
  label: string;
  description: string;
  category: 'core' | 'prerequisite' | 'application';
  source_page?: number;
  importance: number;
}

export interface ConceptEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  is_prerequisite: boolean;
}

export interface ConceptMapData {
  topic: string;
  subject: string;
  educational_level: string;
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  summary: string;
  document_title?: string;
}

export interface StudyPlanTask {
  id: string;
  plan_id: string;
  title: string;
  description?: string;
  subject: string;
  topic: string;
  estimated_minutes: number;
  task_type: 'NEW_CONCEPT' | 'PRACTICE' | 'REVISION' | 'MOCK_TEST';
  scheduled_date: string;
  is_completed: boolean;
  completed_at?: string;
}

export interface StudyPlan {
  id: string;
  user_id: string;
  title: string;
  goal: string;
  target_date?: string;
  daily_study_minutes: number;
  subjects: string[];
  is_active: boolean;
  created_at: string;
  tasks: StudyPlanTask[];
}

export interface Flashcard {
  id: string;
  front_prompt: string;
  back_answer: string;
  subject: string;
  topic: string;
  document_id?: string;
  source_page?: number;
  repetition_count: number;
  interval_days: number;
  ease_factor: number;
  next_review_date: string;
  last_reviewed_at?: string;
}

export interface PersonalMemory {
  id: string;
  user_id: string;
  category: string;
  memory_text: string;
  confidence: number;
  created_at: string;
  updated_at: string;
}

export interface SharedKnowledgeItem {
  id: string;
  contributor_id?: string;
  subject: string;
  topic: string;
  educational_level: string;
  title: string;
  content: string;
  source_reference?: string;
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewed_by?: string;
  review_notes?: string;
  upvotes: number;
  created_at: string;
  verified_at?: string;
}

export interface SystemStatus {
  status: string;
  project: string;
  version: string;
  ai_engine: {
    provider: string;
    model: string;
    has_api_key: boolean;
    mode: string;
    message: string;
  };
  supported_languages: Array<{ code: string; name: string }>;
}
