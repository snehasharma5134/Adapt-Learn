import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words='english',
            max_features=5000,
            sublinear_tf=True
        )

    def vectorize_texts(self, texts: List[str]) -> List[List[float]]:
        """Fits and transforms a collection of texts into normalized embedding vectors."""
        if not texts:
            return []
        try:
            tfidf_matrix = self.vectorizer.fit_transform(texts)
            # Return as float lists for JSON serialization
            return tfidf_matrix.toarray().tolist()
        except Exception as e:
            logger.warning(f"Vectorization fallback: {e}")
            return [[0.0] * 10 for _ in texts]

    def rank_chunks(self, query: str, chunks: List[Dict[str, Any]], top_k: int = 5) -> List[Tuple[Dict[str, Any], float]]:
        """
        Ranks document chunks against a query using TF-IDF cosine similarity.
        Returns sorted list of (chunk, similarity_score).
        """
        if not chunks or not query:
            return []

        chunk_texts = [c["chunk_text"] for c in chunks]
        corpus = [query] + chunk_texts

        try:
            vec = TfidfVectorizer(ngram_range=(1, 2), stop_words='english', sublinear_tf=True)
            tfidf_mat = vec.fit_transform(corpus)
            query_vec = tfidf_mat[0:1]
            chunk_vecs = tfidf_mat[1:]

            sims = cosine_similarity(query_vec, chunk_vecs)[0]

            ranked = []
            for idx, score in enumerate(sims):
                ranked.append((chunks[idx], float(score)))

            ranked.sort(key=lambda x: x[1], reverse=True)
            return ranked[:top_k]
        except Exception as e:
            logger.error(f"Error ranking chunks: {e}")
            # Fallback: simple token overlap
            q_tokens = set(query.lower().split())
            scored = []
            for c in chunks:
                c_tokens = set(c["chunk_text"].lower().split())
                overlap = len(q_tokens.intersection(c_tokens))
                scored.append((c, float(overlap) / max(len(q_tokens), 1)))
            scored.sort(key=lambda x: x[1], reverse=True)
            return scored[:top_k]

embedding_service = EmbeddingService()
