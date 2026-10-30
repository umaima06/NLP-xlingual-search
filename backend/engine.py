"""Core NLP engine: loads a pretrained multilingual transformer, embeds the corpus,
and ranks sentences by cosine similarity. No hand-written language rules anywhere.
"""
import hashlib
import json
from pathlib import Path

import numpy as np
from sentence_transformers import SentenceTransformer

import config

BASE = Path(__file__).parent
CORPUS_FILE = BASE / "corpus.json"
EMB_FILE = BASE / "embeddings.npy"
META_FILE = BASE / "embeddings.meta.json"
LANGS = ("en", "hi", "te")


def detect_script(text: str) -> str:
    """Display-only helper: which writing system dominates the input (Unicode blocks)."""
    counts = {"hi": 0, "te": 0, "en": 0}
    for ch in text:
        o = ord(ch)
        if 0x0900 <= o <= 0x097F:
            counts["hi"] += 1
        elif 0x0C00 <= o <= 0x0C7F:
            counts["te"] += 1
        elif ch.isalpha():
            counts["en"] += 1
    best = max(counts, key=counts.get)
    return best if counts[best] > 0 else "unknown"


class Engine:
    def __init__(self):
        print(f"[engine] Loading model: {config.MODEL_NAME}")
        self.model = SentenceTransformer(config.MODEL_NAME)
        self.items = self._load_corpus()
        self.emb = self._load_or_build()
        print(f"[engine] Ready. {len(self.items)} sentences, dim={self.emb.shape[1]}")

    # ---------- corpus + cache ----------
    def _load_corpus(self):
        groups = json.loads(CORPUS_FILE.read_text(encoding="utf-8"))
        items = []
        for gid, g in enumerate(groups):
            for lang in LANGS:
                if g.get(lang):
                    items.append({"id": len(items), "gid": gid, "topic": g["topic"],
                                  "lang": lang, "text": g[lang]})
        return items

    def _encode(self, texts, prefix):
        return self.model.encode([prefix + t for t in texts], normalize_embeddings=True,
                                 show_progress_bar=False, batch_size=32)

    def _signature(self):
        h = hashlib.md5(CORPUS_FILE.read_bytes()).hexdigest()
        return {"model": config.MODEL_NAME, "corpus_md5": h}

    def build(self):
        emb = self._encode([i["text"] for i in self.items], config.PASSAGE_PREFIX)
        np.save(EMB_FILE, emb)
        META_FILE.write_text(json.dumps(self._signature()), encoding="utf-8")
        return emb

    def _load_or_build(self):
        if EMB_FILE.exists() and META_FILE.exists():
            try:
                if json.loads(META_FILE.read_text(encoding="utf-8")) == self._signature():
                    emb = np.load(EMB_FILE)
                    if len(emb) == len(self.items):
                        return emb
            except Exception:
                pass
        print("[engine] Building embeddings (one-time, cached afterwards)...")
        return self.build()

    # ---------- search / compare / map ----------
    def strength(self, score: float) -> float:
        f = config.SCORE_FLOOR
        return float(min(1.0, max(0.0, (score - f) / (1.0 - f))))

    def search(self, query: str, top_k: int = 5, strict: bool = True):
        q = self._encode([query], config.QUERY_PREFIX)[0]
        scores = self.emb @ q
        order = np.argsort(-scores)[:top_k]
        best = float(scores[order[0]])
        results = []
        for idx in order:
            s = float(scores[idx])
            confident = s >= config.THRESHOLD
            if strict and not confident:
                continue
            it = self.items[idx]
            results.append({**it, "score": round(s, 4), "strength": round(self.strength(s), 4),
                            "confident": confident})
        return {"matched": best >= config.THRESHOLD, "strict": strict, "best_score": round(best, 4),
                "threshold": config.THRESHOLD, "query_script": detect_script(query),
                "results": results}

    def compare(self, a: str, b: str):
        va, vb = self._encode([a, b], config.QUERY_PREFIX)
        s = float(va @ vb)
        st = self.strength(s)
        verdict = "Very similar meaning" if st >= 0.6 else "Related" if st >= 0.35 else "Different meaning"
        return {"score": round(s, 4), "strength": round(st, 4), "verdict": verdict,
                "script_a": detect_script(a), "script_b": detect_script(b)}
