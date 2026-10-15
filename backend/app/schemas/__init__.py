from app.schemas.auth import Token, TokenPayload, UserRegister, UserLogin, UserResponse, UserProfileSchema
from app.schemas.profile import ProfileUpdate, ProfileResponse, ConsentUpdate, ConsentResponse
from app.schemas.document import DocumentResponse, DocumentDetailResponse, DocumentPageResponse, DocumentSummaryResponse
from app.schemas.tutor import TutorChatRequest, TutorChatResponse, CitationItem, MessageResponse, ConversationResponse
from app.schemas.quiz import (
    QuizGenerateRequest, QuizQuestionSchema, QuizResponseSchema,
    QuizSubmitRequest, QuizSubmitResponse, QuizAttemptHistoryItem
)
from app.schemas.learning import MasteryResponse, StreakResponse, AchievementItem, LearningStatsResponse
from app.schemas.recommendation import RecommendationResponse, RecommendationFeedbackRequest
from app.schemas.concept_map import ConceptMapGenerateRequest, ConceptNode, ConceptEdge, ConceptMapResponse
from app.schemas.study_plan import StudyPlanGenerateRequest, StudyPlanResponse, StudyPlanTaskResponse, TaskUpdateStatusRequest
from app.schemas.flashcard import FlashcardCreateRequest, FlashcardResponse, FlashcardReviewRequest, FlashcardReviewResponse
from app.schemas.memory import PersonalMemoryCreate, PersonalMemoryUpdate, PersonalMemoryResponse
from app.schemas.shared_knowledge import SharedKnowledgeCreate, SharedKnowledgeReviewRequest, SharedKnowledgeResponse, FeedbackCreate, FeedbackResponse
