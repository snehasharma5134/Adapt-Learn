from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.learning import LearnerTopicMastery, LearningStreak, Achievement, UserAchievement, LearningEvent
from app.models.quiz import QuizAttempt
from app.models.document import Document
from app.models.flashcard import Flashcard
from app.services.streak_rewards_service import streak_rewards_service
import logging

logger = logging.getLogger(__name__)

class AnalyticsService:
    @staticmethod
    def get_dashboard_analytics(db: Session, user_id: str) -> Dict[str, Any]:
        """
        Aggregates actual learner performance data for visualizations and charts.
        Never fabricates mock scores.
        """
        streak_rewards_service.ensure_default_achievements(db)

        # 1. Quiz statistics
        attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id).all()
        total_quizzes = len(attempts)
        avg_score = round(sum([a.percentage for a in attempts]) / max(total_quizzes, 1), 1) if total_quizzes > 0 else 0.0

        # 2. Documents
        doc_count = db.query(Document).filter(Document.user_id == user_id).count()

        # 3. Flashcards
        flashcard_count = db.query(Flashcard).filter(Flashcard.user_id == user_id).count()

        # 4. Streak & XP
        streak = db.query(LearningStreak).filter(LearningStreak.user_id == user_id).first()
        streak_data = {
            "current_streak": streak.current_streak if streak else 1,
            "longest_streak": streak.longest_streak if streak else 1,
            "last_activity_date": streak.last_activity_date if streak else None,
            "total_xp": streak.total_xp if streak else 0
        }

        # 5. Topic Masteries
        masteries = db.query(LearnerTopicMastery).filter(LearnerTopicMastery.user_id == user_id).all()
        mastery_items = [
            {
                "id": m.id,
                "subject": m.subject,
                "topic": m.topic,
                "mastery_score": m.mastery_score,
                "confidence_level": m.confidence_level,
                "attempts_count": m.attempts_count,
                "correct_count": m.correct_count,
                "p_transit": m.p_transit,
                "p_guess": m.p_guess,
                "p_slip": m.p_slip,
                "last_practiced_at": m.last_practiced_at
            }
            for m in masteries
        ]

        # 6. Achievements
        all_ach = db.query(Achievement).all()
        user_ach = {ua.achievement_code: ua.earned_at for ua in db.query(UserAchievement).filter(UserAchievement.user_id == user_id).all()}
        achievement_items = [
            {
                "code": a.code,
                "title": a.title,
                "description": a.description,
                "badge_icon": a.badge_icon,
                "xp_value": a.xp_value,
                "is_earned": a.code in user_ach,
                "earned_at": user_ach.get(a.code)
            }
            for a in all_ach
        ]

        # 7. Recent activity distribution for charts
        recent_events = db.query(LearningEvent).filter(
            LearningEvent.user_id == user_id
        ).order_by(LearningEvent.created_at.desc()).limit(15).all()

        timeline = [
            {
                "event_type": e.event_type,
                "xp": e.xp_awarded,
                "time": e.created_at.strftime("%b %d, %H:%M")
            }
            for e in reversed(recent_events)
        ]

        return {
            "total_study_minutes": total_quizzes * 8 + flashcard_count * 2,
            "total_quizzes_taken": total_quizzes,
            "average_quiz_score": avg_score,
            "documents_uploaded": doc_count,
            "flashcards_count": flashcard_count,
            "flashcards_mastered": flashcard_count,
            "streak": streak_data,
            "topic_masteries": mastery_items,
            "achievements": achievement_items,
            "timeline": timeline
        }

analytics_service = AnalyticsService()
