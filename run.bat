@echo off
cd backend
call venv\Scripts\activate
set HF_HUB_OFFLINE=1
uvicorn main:app --port 8000
