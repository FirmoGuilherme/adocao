from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float
from typing import List, Optional
from ..database import Base, get_db
from .. import models, schemas
from pydantic import BaseModel

class AdoptionApplication(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    pet_id = Column(Integer, ForeignKey("pets.id"))
    status = Column(String, default="New") # New, Screening, Interview, Approved, Rejected
    housing_type = Column(String)
    motivation = Column(Text)
    compatibility_score = Column(Float, default=85.0)

class ApplicationCreate(BaseModel):
    user_id: int
    pet_id: int
    housing_type: str
    motivation: str

class ApplicationResponse(ApplicationCreate):
    id: int
    status: str
    compatibility_score: float

router = APIRouter(prefix="/applications", tags=["applications"])

@router.post("/", response_model=ApplicationResponse)
def create_application(app_in: ApplicationCreate, db: Session = Depends(get_db)):
    # Create the model inside the function scope to avoid circular imports.
    new_app = AdoptionApplication(**app_in.model_dump())
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app

@router.get("/user/{user_id}", response_model=List[ApplicationResponse])
def get_user_applications(user_id: int, db: Session = Depends(get_db)):
    return db.query(AdoptionApplication).filter(AdoptionApplication.user_id == user_id).all()

@router.put("/{app_id}/status", response_model=ApplicationResponse)
def update_application_status(app_id: int, status: str, db: Session = Depends(get_db)):
    app = db.query(AdoptionApplication).filter(AdoptionApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app.status = status
    db.commit()
    db.refresh(app)
    return app
