import json
from pathlib import Path
from engine import Engine

e = Engine()
tests = json.loads(Path("paraphrase_tests.json").read_text(encoding="utf-8"))
en_gid = {i["text"]: i["gid"] for i in e.items if i["lang"] == "en"}

ok = 0
for t in tests:
    r = e.search(t["query"], top_k=3, strict=False)
    top = r["results"][0]
    hit = top["gid"] == en_gid[t["target"]]
    ok += hit
    print(f"{'OK  ' if hit else 'MISS'} {r['best_score']:.3f}  {t['query']!r}\n      -> {top['text']!r}")
print(f"\nTop-1 correct: {ok}/{len(tests)}")