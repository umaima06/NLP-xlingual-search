"""All tunable settings live here. Change MODEL_NAME to switch models (one line)."""
import os

# Chosen by experiment (calibrate.py + evaluate.py): LaBSE separates matches from
# non-matches by a wide margin; e5 models give compressed, overlapping scores.
MODEL_NAME = os.getenv("MODEL_NAME", "sentence-transformers/LaBSE")

IS_E5 = "e5" in MODEL_NAME.lower()
QUERY_PREFIX = "query: " if IS_E5 else ""
PASSAGE_PREFIX = "passage: " if IS_E5 else ""

# Minimum cosine similarity for a result to count as a match. LaBSE on the 3,204-sentence
# corpus: gibberish max 0.437, unrelated-pair 95th pct 0.430, true-pair 10th pct 0.802.
THRESHOLD = float(os.getenv("THRESHOLD", "0.86" if IS_E5 else "0.55"))

# Display only: stretches the "match strength" bar so unrelated text shows near 0%.
SCORE_FLOOR = float(os.getenv("SCORE_FLOOR", "0.70" if IS_E5 else "0.30"))

MAX_TEXT_LEN = 500
