"""Optional: run once to download the model and pre-compute corpus embeddings.
Do this at HOME with internet, before the presentation."""
from engine import Engine

e = Engine()
e.build()
print(f"Done. Saved embeddings for {len(e.items)} sentences.")
