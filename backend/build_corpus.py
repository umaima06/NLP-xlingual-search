"""corpus.json = your own sentences + FLORES-200 devtest (human-translated, aligned)."""
import json
from pathlib import Path

BASE = Path(__file__).parent
F = BASE / "flores200_dataset" / "devtest"
read = lambda code: (F / f"{code}.devtest").read_text(encoding="utf-8").splitlines()

en, hi, te = read("eng_Latn"), read("hin_Deva"), read("tel_Telu")
assert len(en) == len(hi) == len(te)
path = BASE / "corpus.json"
mine = [g for g in json.loads(path.read_text(encoding="utf-8")) if g["topic"] != "flores"]
flores = [{"topic": "flores", "en": a, "hi": b, "te": c} for a, b, c in zip(en, hi, te)]
path.write_text(json.dumps(mine + flores, ensure_ascii=False), encoding="utf-8")
print(f"{len(mine)} own + {len(flores)} FLORES = {3 * (len(mine) + len(flores))} sentences")