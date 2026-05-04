from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import bcrypt
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/auth", tags=["auth"])


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login", response_model=schemas.User)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == body.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    # Users seeded without password can still log in (backward compat)
    if user.password_hash and not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Senha incorreta")
    return user


@router.post("/signup", response_model=schemas.User, status_code=201)
def signup(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")

    user_data = user_in.model_dump(exclude={"password"})
    user_data["password_hash"] = hash_password(user_in.password)

    new_user = models.User(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.get("/me", response_model=schemas.User)
def get_current_user(email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return user
