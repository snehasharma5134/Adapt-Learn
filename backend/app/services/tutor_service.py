from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.conversation import Conversation, ConversationMessage
from app.models.memory import PersonalMemory
from app.models.user import User, UserProfile
from app.integrations.llm_provider import llm_provider
import logging

logger = logging.getLogger(__name__)

class AITutorService:
    @staticmethod
    async def chat(
        db: Session,
        user_id: str,
        message: str,
        conversation_id: Optional[str] = None,
        explanation_depth: str = "standard",
        target_language: Optional[str] = None,
        educational_level: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Handles general AI tutoring conversations with multilingual adaptation,
        educational level matching, explanation depth control, and session history.
        """
        user = db.query(User).filter(User.id == user_id).first()
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

        # Determine language and level
        lang = target_language or (profile.preferred_language if profile else "English")
        level = educational_level or (profile.current_level if profile else "Undergraduate")
        style = profile.preferred_style if profile else "intuitive_analogy"

        # Fetch or create conversation
        if conversation_id:
            conv = db.query(Conversation).filter(Conversation.id == conversation_id, Conversation.user_id == user_id).first()
            if not conv:
                conv = Conversation(user_id=user_id, title=message[:40], language=lang, educational_level=level)
                db.add(conv)
                db.commit()
                db.refresh(conv)
        else:
            conv = Conversation(user_id=user_id, title=message[:40], language=lang, educational_level=level)
            db.add(conv)
            db.commit()
            db.refresh(conv)

        # Retrieve relevant personal memories for the user
        memories = db.query(PersonalMemory).filter(PersonalMemory.user_id == user_id).all()
        memory_context = ""
        if memories:
            memory_context = "Learner Profile & Personal Memory:\n" + "\n".join([f"- {m.category}: {m.memory_text}" for m in memories[:4]])

        # Load recent conversation history (up to last 6 messages)
        recent_messages = db.query(ConversationMessage).filter(
            ConversationMessage.conversation_id == conv.id
        ).order_by(ConversationMessage.created_at.asc()).all()[-6:]

        history_text = ""
        for m in recent_messages:
            history_text += f"{m.sender.upper()}: {m.content}\n"

        # Record incoming user message
        user_msg = ConversationMessage(
            conversation_id=conv.id,
            sender="user",
            content=message
        )
        db.add(user_msg)
        db.commit()

        # Build prompt adapting to depth and language
        depth_instructions = {
            "simpler": "Explain in very simple words using intuitive everyday analogies. Avoid heavy jargon unless defined immediately.",
            "standard": "Provide a clear, balanced explanation with intuitive reasoning and formal definitions.",
            "detailed": "Provide a comprehensive, deep-dive academic explanation covering governing principles, derivations, and edge cases.",
            "step_by_step": "Break the concept into sequential, numbered, easy-to-follow steps.",
            "analogy": "Teach this using a creative, vivid real-world metaphor or story.",
            "practice_question": "After a brief clarification, generate a high-yield practice question with hints to check understanding."
        }.get(explanation_depth, "Provide a clear, balanced explanation.")

        system_prompt = (
            f"You are the AI Learning Companion, an expert, supportive pedagogical tutor.\n"
            f"Target Learner Level: {level}\n"
            f"Explanation Language: {lang}\n"
            f"Instruction Style: {style}\n\n"
            f"{memory_context}\n\n"
            f"GUIDELINES:\n"
            f"1. Explain in {lang}. If using technical formulas or standard scientific terms, keep international notation.\n"
            f"2. Calibrate depth to {level}. For younger students use simple analogies; for university/advanced exams use mathematical rigor.\n"
            f"3. Style direction: {depth_instructions}\n"
            f"4. Format equations using KaTeX ($...$ for inline, $$...$$ for display blocks).\n"
            f"5. End with an engaging checking question or encouraging follow-up prompt."
        )

        full_prompt = (
            f"Conversation History:\n{history_text}\n"
            f"USER: {message}\n"
            f"ASSISTANT:"
        )

        response_text = await llm_provider.generate_text(full_prompt, system_prompt=system_prompt)

        # Save assistant response
        assistant_msg = ConversationMessage(
            conversation_id=conv.id,
            sender="assistant",
            content=response_text,
            citations=[]
        )
        db.add(assistant_msg)
        db.commit()
        db.refresh(assistant_msg)

        # Generate follow-up suggestions
        suggestions = [
            f"Can you explain this with a simpler analogy in {lang}?",
            "Give me a step-by-step numerical example.",
            "Test my understanding with a practice question."
        ]

        return {
            "conversation_id": conv.id,
            "message_id": assistant_msg.id,
            "content": response_text,
            "citations": [],
            "grounding_type": "general_knowledge",
            "follow_up_suggestions": suggestions,
            "created_at": assistant_msg.created_at
        }

ai_tutor_service = AITutorService()
