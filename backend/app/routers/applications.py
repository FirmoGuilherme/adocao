from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import AdoptionApplication
from ..schemas import ApplicationCreate, ApplicationResponse

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("/", response_model=ApplicationResponse, status_code=201)
def create_application(app_in: ApplicationCreate, db: Session = Depends(get_db)):
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
