import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import get_engine, get_session_local
from . import models

app = FastAPI(title="Adocão API", description="API for Adocão SaaS MVP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .routers import auth, pets, shelters, applications, pet_health, pet_temperament, pet_media, user_profile, volunteers, admin
app.include_router(auth.router)
app.include_router(pets.router)
app.include_router(shelters.router)
app.include_router(applications.router)
app.include_router(pet_health.router)
app.include_router(pet_temperament.router)
app.include_router(pet_media.router)
app.include_router(user_profile.router)
app.include_router(volunteers.router)
app.include_router(admin.router)

# Serve uploaded files as static assets
UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.on_event("startup")
def on_startup():
    import time
    from sqlalchemy.exc import OperationalError
    from sqlalchemy import text, inspect
    max_retries = 5
    for i in range(max_retries):
        try:
            engine = get_engine()
            models.Base.metadata.create_all(bind=engine)
            # Add password_hash column if missing (lightweight migration)
            inspector = inspect(engine)
            columns = [c["name"] for c in inspector.get_columns("users")]
            if "password_hash" not in columns:
                with engine.begin() as conn:
                    conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR"))
                print("Added password_hash column to users table.")
            if "approved" not in columns:
                with engine.begin() as conn:
                    conn.execute(text("ALTER TABLE users ADD COLUMN approved BOOLEAN DEFAULT TRUE"))
                    conn.execute(text("UPDATE users SET approved = TRUE"))
                print("Added approved column to users table.")

            # Seed admin user if not exists
            import bcrypt
            DbSession = get_session_local()
            db = DbSession()
            admin_exists = db.query(models.User).filter(models.User.role == "admin").first()
            if not admin_exists:
                admin_hash = bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode("utf-8")
                admin_user = models.User(
                    name="admin",
                    email="admin@adocao.com",
                    city="Brasil",
                    state="BR",
                    role="admin",
                    password_hash=admin_hash,
                    approved=True
                )
                db.add(admin_user)
                db.commit()
                print("Admin user seeded: admin@adocao.com / admin123")
            db.close()

            print("Database connected and tables created!")
            break
        except OperationalError as e:
            if i == max_retries - 1:
                raise e
            print(f"Database not ready, retrying in 2 seconds... ({i+1}/{max_retries})")
            time.sleep(2)


@app.get("/")
def read_root():
    return {"message": "Welcome to Adocão API"}
