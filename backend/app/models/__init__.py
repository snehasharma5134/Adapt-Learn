from app.core.database import Base
from app.models.user import User, UserProfile, UserConsent
from app.models.document import Document, DocumentPage, DocumentChunk
from app.models.conversation import Conversation, ConversationMessage
from app.models.quiz import Quiz, QuizQuestion, QuizAttempt, QuizResponse, QuestionHistory
from app.models.learning import LearnerTopicMastery, LearningStreak, Achievement, UserAchievement, LearningEvent
from app.models.recommendation import Recommendation
from app.models.study_plan import StudyPlan, StudyPlanTask
from app.models.flashcard import Flashcard, FlashcardReview
from app.models.memory import PersonalMemory
from app.models.shared_knowledge import SharedKnowledgeEntry, UserFeedback

__all__ = [
    "Base",
    "User",
    "UserProfile",
    "UserConsent",
    "Document",
    "DocumentPage",
    "DocumentChunk",
    "Conversation",
    "ConversationMessage",
    "Quiz",
    "QuizQuestion",
    "QuizAttempt",
    "QuizResponse",
    "QuestionHistory",
    "LearnerTopicMastery",
    "LearningStreak",
    "Achievement",
    "UserAchievement",
    "LearningEvent",
    "Recommendation",
    "StudyPlan",
    "StudyPlanTask",
    "Flashcard",
    "FlashcardReview",
    "PersonalMemory",
    "SharedKnowledgeEntry",
    "UserFeedback",
]
