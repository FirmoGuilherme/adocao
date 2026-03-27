from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from . import models

import time
from sqlalchemy.exc import OperationalError

# Create database tables with retry logic
max_retries = 5
for i in range(max_retries):
    try:
        models.Base.metadata.create_all(bind=engine)
        print("Database connected and tables created!")
        break
    except OperationalError as e:
        if i == max_retries - 1:
            raise e
        print(f"Database not ready, retrying in 2 seconds... ({i+1}/{max_retries})")
        time.sleep(2)

app = FastAPI(title="Adocão API", description="API for Adocão SaaS MVP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .routers import auth, pets, shelters, applications
app.include_router(auth.router)
app.include_router(pets.router)
app.include_router(shelters.router)
app.include_router(applications.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Adocão API"}
