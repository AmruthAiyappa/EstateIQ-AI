import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
load_dotenv(os.path.join(project_root, ".env"))

# Import routers
from backend.routes import properties, crm, advisor

app = FastAPI(
    title="EstateIQ AI API",
    description="Backend API for EstateIQ AI - Real Estate Investment Advisor",
    version="1.0.0"
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "EstateIQ AI Backend",
        "message": "AI-Powered Real Estate Investment Decision Support active"
    }

# Register routers
app.include_router(properties.router)
app.include_router(crm.router)
app.include_router(advisor.router)

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
