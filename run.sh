#!/bin/bash
cd backend
source venv/bin/activate
uvicorn main:app --port 8000
