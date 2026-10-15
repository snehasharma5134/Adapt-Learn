from datetime import date, datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.study_plan import StudyPlan, StudyPlanTask
from app.models.learning import LearnerTopicMastery
from app.models.user import UserProfile
import logging

logger = logging.getLogger(__name__)

class StudyPlannerService:
    @staticmethod
    def generate_plan(
        db: Session,
        user_id: str,
        goal: str,
        target_date: Optional[date] = None,
        daily_study_minutes: int = 60,
        subjects: List[str] = None,
        focus_on_weak_topics: bool = True
    ) -> StudyPlan:
        """
        Synthesizes an adaptive multi-day study schedule balancing
        new concepts, weak topic remediation, and revision tasks.
        """
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if not subjects and profile and profile.subjects_of_interest:
            subjects = profile.subjects_of_interest
        if not subjects:
            subjects = ["General Science", "Applied Mathematics"]

        # Deactivate existing active plans
        db.query(StudyPlan).filter(
            StudyPlan.user_id == user_id,
            StudyPlan.is_active == True
        ).update({"is_active": False})
        db.commit()

        # Create new plan
        plan = StudyPlan(
            user_id=user_id,
            title=f"Adaptive Plan: {goal[:50]}",
            goal=goal,
            target_date=target_date,
            daily_study_minutes=daily_study_minutes,
            subjects=subjects,
            is_active=True
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)

        # Identify weak topics from knowledge tracing
        weak_topics = []
        if focus_on_weak_topics:
            masteries = db.query(LearnerTopicMastery).filter(
                LearnerTopicMastery.user_id == user_id,
                LearnerTopicMastery.mastery_score < 0.60
            ).all()
            weak_topics = [m.topic for m in masteries]

        # Generate schedule for next 7 days
        today = date.today()
        task_types = ["NEW_CONCEPT", "PRACTICE", "REVISION", "MOCK_TEST"]

        for day_offset in range(7):
            current_day = today + timedelta(days=day_offset)
            subj = subjects[day_offset % len(subjects)]

            # Task 1: Core learning or remediation
            if weak_topics and day_offset % 2 == 1:
                t1_topic = weak_topics[day_offset % len(weak_topics)]
                t1_title = f"Review & Deep Dive: {t1_topic}"
                t1_type = "PRACTICE"
                t1_desc = f"Targeted remediation for weak topic {t1_topic}. Focus on foundational misconceptions."
            else:
                t1_topic = f"{subj} Core Module {day_offset + 1}"
                t1_title = f"Master New Topic: {t1_topic}"
                t1_type = "NEW_CONCEPT"
                t1_desc = f"Explore key principles, take notes, and analyze example problems."

            task1 = StudyPlanTask(
                plan_id=plan.id,
                title=t1_title,
                description=t1_desc,
                subject=subj,
                topic=t1_topic,
                estimated_minutes=int(daily_study_minutes * 0.6),
                task_type=t1_type,
                scheduled_date=current_day
            )
            db.add(task1)

            # Task 2: Active Recall or Practice
            t2_type = "REVISION" if day_offset % 3 == 0 else "PRACTICE"
            t2_title = f"Practice Quiz & Flashcards ({subj})"
            task2 = StudyPlanTask(
                plan_id=plan.id,
                title=t2_title,
                description=f"Active recall session: generate an MCQ quiz and review due flashcards.",
                subject=subj,
                topic=f"{subj} Practice",
                estimated_minutes=int(daily_study_minutes * 0.4),
                task_type=t2_type,
                scheduled_date=current_day
            )
            db.add(task2)

        db.commit()
        db.refresh(plan)
        return plan

    @staticmethod
    def update_task_status(db: Session, task_id: str, is_completed: bool) -> StudyPlanTask:
        task = db.query(StudyPlanTask).filter(StudyPlanTask.id == task_id).first()
        if not task:
            raise ValueError("Task not found.")

        task.is_completed = is_completed
        task.completed_at = datetime.now(timezone.utc) if is_completed else None
        db.commit()
        db.refresh(task)
        return task

study_planner_service = StudyPlannerService()
