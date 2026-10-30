"""Finds a sensible similarity THRESHOLD for your model using your own corpus.
Run:  python calibrate.py     then set THRESHOLD in config.py (or env var)."""
import random
import numpy as np
import config
from engine import Engine

e = Engine()
by_gid = {}
for it in e.items:
    by_gid.setdefault(it["gid"], []).append(it["id"])

related = [float(e.emb[a] @ e.emb[b]) for ids in by_gid.values()
           for i, a in enumerate(ids) for b in ids[i + 1:]]

rng, unrelated = random.Random(0), []
while len(unrelated) < 3000:
    a, b = rng.sample(range(len(e.items)), 2)
    if e.items[a]["gid"] != e.items[b]["gid"]:
        unrelated.append(float(e.emb[a] @ e.emb[b]))

junk = ["asdfghjkl qwerty", "zzzz xxxx qqqq", "blah blah 12345", "!!! ??? ###",
        "lorem ipsum dolor", "xkcd fjdk slkd", "ఆఆఆ ఈఈఈ", "ददद ककक"]
junk_best = [e.search(j, 1)["best_score"] for j in junk]

p = lambda arr, q: float(np.percentile(arr, q))
print("\n=== Cosine similarity statistics ===")
print(f"Same meaning (other languages) : mean {np.mean(related):.3f} | 10th pct {p(related,10):.3f} | min {min(related):.3f}")
print(f"Different meaning              : mean {np.mean(unrelated):.3f} | 95th pct {p(unrelated,95):.3f} | max {max(unrelated):.3f}")
print(f"Gibberish best-match scores    : max {max(junk_best):.3f}")
for j, s in zip(junk, junk_best):
    print(f"   {j!r:28} -> {s:.3f}")
sug = round((max(junk_best) + p(related, 10)) / 2, 2)
print(f"\nSuggested THRESHOLD ≈ {sug}   (currently {config.THRESHOLD})")
print("Set it in config.py, or run with:  THRESHOLD=%s uvicorn main:app --port 8000" % sug)