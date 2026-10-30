# Cross-Lingual Semantic Search

Search sentences by **meaning**, not keywords, across **English, Hindi (हिन्दी) and Telugu (తెలుగు)**.
Type a sentence in any of the three languages and get the closest-meaning sentences from a
3,204-sentence collection, in any language, with similarity scores. If nothing is close
enough, the app says so instead of guessing.

NLP assignment · JNTUH B.Tech CSE III Year I Sem · Unit V: Multilingual and Cross-Lingual Language Modeling

Example: the query `It is raining heavily today` finds `आज बहुत तेज़ बारिश हो रही है` and
`ఈ రోజు భారీ వర్షం పడుతోంది`. The three sentences share no words and no script.

## Features
- **Search page:** top-5 results with language badges, raw cosine score, match-strength bar, topic,
  detected query script, clickable example queries, and a toggle to always show the closest sentences.
- **Compare page:** any two sentences in any languages give a similarity percentage and a verdict.
- **"No close match found"** for gibberish or out-of-collection queries (threshold calibrated from data).
- REST API with automatic Swagger docs at `/docs`.
- One command runs backend and frontend together; works offline once the model is cached.

## How it works
1. **Offline, once:** every corpus sentence is embedded by a pretrained multilingual transformer
   (LaBSE, 768 dimensions) and cached in `embeddings.npy`. The cache stores the model name and an
   MD5 of `corpus.json`, so it rebuilds automatically when either changes.
2. **At query time:** the query is embedded by the same model.
3. **Similarity:** cosine similarity against all stored vectors (one NumPy matrix product;
   embeddings are normalised, so cosine = dot product).
4. **Ranking and filter:** the top `top_k` results are returned. A result is "confident" when
   its score is at least `THRESHOLD` (0.55). In strict mode, other results are dropped.

No language-specific rules are written anywhere. The only text helper is display-only: it reports
which script (English, Hindi or Telugu) the query uses, by Unicode block.

## Tech stack
| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | FastAPI, Uvicorn, Pydantic |
| NLP | sentence-transformers, `sentence-transformers/LaBSE` |
| Math | NumPy |
| Data | `corpus.json` + `embeddings.npy` (no database) |

## Dataset
3,204 sentences = 1,068 meanings x 3 languages:
- 56 hand-written everyday meanings (weather, food, college, travel, health, technology, family, sports, ...)
- 1,012 sentences from the **FLORES-200 devtest** split (NLLB Team, 2022), aligned in English,
  Hindi and Telugu. Check the FLORES licence on its GitHub page before redistributing.

Format of each entry in `corpus.json`:
```json
{"topic": "weather", "en": "It is raining heavily today.", "hi": "आज बहुत तेज़ बारिश हो रही है।", "te": "ఈ రోజు భారీ వర్షం పడుతోంది."}
```

## Results
Measured on this collection with the scripts in `backend/`.

| Model | Dim | Avg P@1* | True-match 10th pct | Gibberish max | Gap |
|---|---|---|---|---|---|
| multilingual-e5-small | 384 | 99.5% | 0.866 | 0.875 | -0.009 |
| multilingual-e5-base | 768 | 99.8% | 0.849 | 0.838 | +0.011 |
| **LaBSE (used)** | 768 | **100.0%** | 0.802 | **0.437** | **+0.365** |

\*P@1: a sentence's translation ranked first among 1,068 candidates in another language, averaged over 6 directions.

All models are accurate, but only LaBSE separates real matches from nonsense, so only it supports a
reliable "no match" threshold. Paraphrase test (12 queries not in the corpus): **11/12 correct**.

## Project structure
```
xlingual-search/
├── backend/
│   ├── main.py                 FastAPI app: /api/search, /api/compare, /api/info, serves frontend/dist
│   ├── engine.py               model loading, corpus, embedding cache, search, compare
│   ├── config.py               MODEL_NAME, THRESHOLD, SCORE_FLOOR (env-overridable)
│   ├── build_corpus.py         merges own sentences + FLORES-200 devtest into corpus.json
│   ├── build_embeddings.py     pre-computes embeddings.npy
│   ├── calibrate.py            score statistics and suggested threshold
│   ├── evaluate.py             cross-lingual P@1 / P@3
│   ├── paraphrase_test.py      top-1 test on paraphrased queries
│   ├── paraphrase_tests.json   the paraphrase queries and targets
│   ├── corpus.json, embeddings.npy, embeddings.meta.json
│   └── requirements.txt
├── frontend/
│   ├── src/ App.jsx, api.js, lang.js, main.jsx, index.css, components/{SearchPage,ComparePage}.jsx
│   ├── dist/                   built app (served by FastAPI)
│   └── package.json, vite.config.js, tailwind.config.js, postcss.config.js
├── run.bat · run.sh
└── README.md
```

## Setup (first time, needs internet)
Requirements: Python 3 and Node.js 18+ (Node is only needed to rebuild the frontend). The first run downloads the
LaBSE model (about 1.8 GB) into the Hugging Face cache; after that it works offline.

**Backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows   (Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
python build_embeddings.py     # downloads the model, builds embeddings.npy
```

**Frontend** (only if `frontend/dist` is missing or you changed the UI)
```bash
cd frontend
npm install
npm run build
```

## Run
```bash
.\run.bat        # Windows PowerShell   (in cmd: run.bat)
./run.sh         # Mac / Linux
```
Open http://127.0.0.1:8000 (app) or http://127.0.0.1:8000/docs (API docs).

`run.bat`:
```bat
@echo off
cd backend
call venv\Scripts\activate
set HF_HUB_OFFLINE=1
uvicorn main:app --port 8000
```
`run.sh`:
```bash
#!/bin/bash
cd backend
source venv/bin/activate
export HF_HUB_OFFLINE=1
uvicorn main:app --port 8000
```
`HF_HUB_OFFLINE=1` stops the model from contacting Hugging Face on startup. Remove that line on the very
first run if the model is not downloaded yet.

**Development mode** (hot reload): run `uvicorn main:app --reload --port 8000` in `backend/`,
and `npm run dev` in `frontend/` (http://localhost:5173, API calls proxied to port 8000).

## Configuration (`backend/config.py`)
| Setting | Default | Meaning |
|---|---|---|
| `MODEL_NAME` | `sentence-transformers/LaBSE` | any sentence-transformers model; E5 models get `query:`/`passage:` prefixes automatically |
| `THRESHOLD` | 0.55 (LaBSE) | minimum cosine score for a confident match |
| `SCORE_FLOOR` | 0.30 (LaBSE) | display-only: stretches the strength bar to 0-100% |
| `MAX_TEXT_LEN` | 500 | maximum characters per input |

Override with environment variables, e.g. PowerShell: `$env:MODEL_NAME="intfloat/multilingual-e5-base"`.
After changing the model, run `python build_embeddings.py` (or just start the app; it rebuilds automatically).

## Evaluation scripts (run inside `backend/`, venv active)
```bash
python calibrate.py         # score distributions: same meaning vs different meaning vs gibberish
python evaluate.py          # cross-lingual P@1 / P@3 for the 6 language directions
python paraphrase_test.py   # top-1 check on queries that are not in the corpus
```

## Rebuilding the corpus
```bash
cd backend
curl.exe -L -o flores200_dataset.tar.gz https://dl.fbaipublicfiles.com/nllb/flores200_dataset.tar.gz
tar -xf flores200_dataset.tar.gz
python build_corpus.py      # keeps your own sentences, replaces the FLORES part
python build_embeddings.py
```
Delete `flores200_dataset.tar.gz` and `flores200_dataset/` afterwards; `corpus.json` already contains the data.

## API
| Method | Endpoint | Body |
|---|---|---|
| GET | `/api/info` | none: returns model, corpus size, dimensions, threshold |
| POST | `/api/search` | `{"query": "...", "top_k": 5, "strict": true}` |
| POST | `/api/compare` | `{"text_a": "...", "text_b": "..."}` |

```bash
curl -X POST http://127.0.0.1:8000/api/search -H "Content-Type: application/json" \
     -d "{\"query\": \"I am hungry\", \"top_k\": 3}"
```
A search response contains `matched`, `strict`, `best_score`, `threshold`, `query_script`, and
`results[]` with `id`, `gid`, `topic`, `lang`, `text`, `score`, `strength`, `confident`.

## Troubleshooting
- **`run.bat` is not recognized in PowerShell:** use `.\run.bat`.
- **Cannot reach the backend (red box in the UI):** start the backend; check port 8000 is free.
- **Page shows old UI:** run `npm run build` in `frontend/` and refresh.
- **Hangs on startup with no internet:** make sure `HF_HUB_OFFLINE=1` is set and the model was downloaded once.
- **Hugging Face symlink warning on Windows:** harmless; caching still works.
- **`npm audit` warnings:** development-tool advisories; do not run `npm audit fix --force`.

## Limitations
- Idiomatic same-language paraphrases can score low (LaBSE is trained mainly on translation pairs).
- Romanised input ("nenu college ki vastanu") matches poorly; use native scripts.
- Only the 1,068 meanings in the collection can be returned.
- The strength percentage is a rescaled cosine score, not a probability.
- Models are used as released, with no fine-tuning.

## Credits
- LaBSE: Feng et al., *Language-agnostic BERT Sentence Embedding*, ACL 2022.
- multilingual-E5: Wang et al., *Multilingual E5 Text Embeddings: A Technical Report*, 2024.
- FLORES-200: NLLB Team, *No Language Left Behind*, 2022.
- sentence-transformers: Reimers and Gurevych, EMNLP 2019.