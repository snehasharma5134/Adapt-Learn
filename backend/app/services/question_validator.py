import hashlib
import re
from typing import Dict, Any, Tuple, Optional

class QuestionValidator:
    @staticmethod
    def compute_fingerprint(question_text: str) -> str:
        """Computes a normalized SHA-256 hash fingerprint for duplicate detection."""
        # Normalize: lowercase, remove non-alphanumeric, strip extra whitespace
        cleaned = re.sub(r'[^a-zA-Z0-9\s]', '', question_text.lower())
        normalized = ' '.join(cleaned.split())
        return hashlib.sha256(normalized.encode('utf-8')).hexdigest()

    @staticmethod
    def validate_question(q: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """
        Validates question structural integrity, option distinctness,
        and answer alignment.
        """
        question_text = q.get("question") or q.get("question_text", "")
        if not question_text or len(question_text.strip()) < 10:
            return False, "Question text is too short or empty."

        options = q.get("options", {})
        if not isinstance(options, dict) or len(options) != 4:
            return False, "Question must have exactly 4 options (A, B, C, D)."

        for key in ["A", "B", "C", "D"]:
            if key not in options or not options[key].strip():
                return False, f"Missing or empty option '{key}'."

        # Check for duplicate options
        opt_values = [v.strip().lower() for v in options.values()]
        if len(set(opt_values)) < 4:
            return False, "Duplicate answer options detected."

        correct_answer = q.get("answer") or q.get("correct_answer", "")
        if correct_answer not in ["A", "B", "C", "D"]:
            return False, f"Correct answer '{correct_answer}' is not a valid choice (A, B, C, D)."

        explanation = q.get("explanation", "")
        if not explanation or len(explanation.strip()) < 5:
            return False, "Explanation must not be empty."

        return True, None

question_validator = QuestionValidator()
