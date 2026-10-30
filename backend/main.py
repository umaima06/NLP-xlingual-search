"""FastAPI backend. Run:  uvicorn main:app --port 8000
Swagger UI (API docs) is automatically available at http://127.0.0.1:8000/docs"""
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator

import config
from engine import Engine

app = FastAPI(title="Cross-Lingual Semantic Search",
              description="Meaning-based search across English, Hindi and Telugu "
                          "using a pretrained multilingual transformer.")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

engine = Engine()


class SearchReq(BaseModel):
    query: str = Field(..., max_length=config.MAX_TEXT_LEN)
    top_k: int = Field(5, ge=1, le=20)
    strict: bool = True  # False = always return the closest sentences, even if low confidence

    @field_validator("query")
    @classmethod
    def not_blank(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Query cannot be empty")
        return v


class CompareReq(BaseModel):
    text_a: str = Field(..., max_length=config.MAX_TEXT_LEN)
    text_b: str = Field(..., max_length=config.MAX_TEXT_LEN)

    @field_validator("text_a", "text_b")
    @classmethod
    def not_blank(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Text cannot be empty")
        return v


@app.get("/api/info")
def info():
    return {"model": config.MODEL_NAME, "corpus_size": len(engine.items),
            "dimensions": int(engine.emb.shape[1]), "threshold": config.THRESHOLD}


@app.post("/api/search")
def search(req: SearchReq):
    return engine.search(req.query, req.top_k, req.strict)


@app.post("/api/compare")
def compare(req: CompareReq):
    return engine.compare(req.text_a, req.text_b)


# Serve the built React app (frontend/dist) from the same server -> ONE command to run everything.
DIST = Path(__file__).parent.parent / "frontend" / "dist"
if DIST.exists():
    app.mount("/", StaticFiles(directory=DIST, html=True), name="frontend")
else:
    @app.get("/")
    def root():
        return {"message": "Backend is running. Build the frontend (npm run build) to see the UI, "
                           "or open /docs for the API."}