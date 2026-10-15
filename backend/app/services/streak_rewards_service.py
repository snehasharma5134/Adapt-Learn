from datetime import date, datetime, timezone, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.learning import LearningStreak, Achievement, UserAchievement, LearningEvent
import logging

logger = logging.getLogger(__name__)

# Standard achievement definitions
DEFAULT_ACHIEVEMENTS = [
    {"code": "FIRST_QUIZ", "title": "First Step", "description": "Completed your first quiz challenge", "badge_icon": "award", "xp_value": 50},
    {"code": "STREAK_3", "title": "Consistent Mind", "description": "Maintained a 3-day continuous study streak", "badge_icon": "flame", "xp_value": 100},
    {"code": "RAG_SCHOLAR", "title": "Doc Explorer", "description": "Successfully queried an uploaded educational document", "badge_icon": "book-open", "xp_value": 50},
    {"code": "MASTERY_HIGH", "title": "Topic Master", "description": "Achieved Strong Understanding (≥75%) in a subject topic", "badge_icon": "zap", "xp_value": 150},
    {"code": "FLASHCARD_PRO", "title": "Memory Champion", "description": "Completed a spaced repetition revision session", "badge_icon": "sparkles", "xp_value": 50},
]

class StreakRewardsService:
    @staticmethod
    def ensure_default_achievements(db: Session):
        for ach in DEFAULT_ACHIEVEMENTS:
            existing = db.query(Achievement).filter(Achievement.code == ach["code"]).first()
            if not existing:
                db.add(Achievement(**ach))
        db.commit()

    @classmethod
    def record_activity_and_award_xp(
        cls,
        db: Session,
        user_id: str,
        event_type: str,
        base_xp: int = 20,
        details: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Server-side validation for recording learning activity,
        updating streaks, awarding XP, and checking for newly unlocked badges.
        """
        cls.ensure_default_achievements(db)
        today = date.today()

        # Fetch or initialize streak
        streak = db.query(LearningStreak).filter(LearningStreak.user_id == user_id).first()
        if not streak:
            streak = LearningStreak(
                user_id=user_id,
                current_streak=1,
                longest_streak=1,
                last_activity_date=today,
                total_xp=0
            )
            db.add(streak)
            db.commit()
            db.refresh(streak)
        else:
            last_date = streak.last_activity_date
            if last_date == today:
                # Already active today, streak remains same
                pass
            elif last_date == (today - timedelta(days=1)):
                # Consecutive day!
                streak.current_streak += 1
                if streak.current_streak > streak.longest_streak:
                    streak.longest_streak = streak.current_streak
                streak.last_activity_date = today
            elif last_date < (today - timedelta(days=1)):
                # Missed a day: reset streak to 1
                streak.current_streak = 1
                streak.last_activity_date = today

        # Award XP
        streak.total_xp += base_xp

        # Log event
        event = LearningEvent(
            user_id=user_id,
            event_type=event_type,
            details=details or {},
            xp_awarded=base_xp
        )
        db.add(event)

        # Check badges
        newly_earned_badges = []
        earned_codes = {ua.achievement_code for ua in db.query(UserAchievement).filter(UserAchievement.user_id == user_id).all()}

        if event_type == "QUIZ_COMPLETED" and "FIRST_QUIZ" not in earned_codes:
            ua = UserAchievement(user_id=user_id, achievement_code="FIRST_QUIZ")
            db.add(ua)
            streak.total_xp += 50
            newly_earned_badges.append("FIRST_QUIZ")

        if streak.current_streak >= 3 and "STREAK_3" not in earned_codes:
            ua = UserAchievement(user_id=user_id, achievement_code="STREAK_3")
            db.add(ua)
            streak.total_xp += 100
            newly_earned_badges.append("STREAK_3")

        if event_type == "DOCUMENT_STUDIED" and "RAG_SCHOLAR" not in earned_codes:
            ua = UserAchievement(user_id=user_id, achievement_code="RAG_SCHOLAR")
            db.add(ua)
            streak.total_xp += 50
            newly_earned_badges.append("RAG_SCHOLAR")

        if event_type == "FLASHCARD_REVIEWED" and "FLASHCARD_PRO" not in earned_codes:
            ua = UserAchievement(user_id=user_id, achievement_code="FLASHCARD_PRO")
            db.add(ua)
            streak.total_xp += 50
            newly_earned_badges.append("FLASHCARD_PRO")

        db.commit()
        db.refresh(streak)

        return {
            "current_streak": streak.current_streak,
            "longest_streak": streak.longest_streak,
            "total_xp": streak.total_xp,
            "xp_awarded": base_xp,
            "newly_earned_badges": newly_earned_badges
        }

streak_rewards_service = StreakRewardsService()
