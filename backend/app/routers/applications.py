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


@router.get("/all", response_model=List[ApplicationResponse])
def get_all_applications(db: Session = Depends(get_db)):
    return db.query(AdoptionApplication).all()


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


@router.put("/{app_id}/contest")
def contest_application(app_id: int, body: dict, db: Session = Depends(get_db)):
    """Adotante contesta rejeição — reabre candidatura como 'Screening'."""
    app = db.query(AdoptionApplication).filter(AdoptionApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    if app.status != "Rejected":
        raise HTTPException(status_code=400, detail="Only rejected applications can be contested")
    app.status = "Screening"
    # Store contest message in motivation (append)
    contest_msg = body.get("message", "")
    if contest_msg:
        app.motivation = (app.motivation or "") + f"\n\n[CONTESTAÇÃO]: {contest_msg}"
    db.commit()
    db.refresh(app)
    return {"status": app.status, "message": "Contestação registrada. Candidatura reaberta para análise."}


@router.delete("/{app_id}", status_code=204)
def delete_application(app_id: int, db: Session = Depends(get_db)):
    """Adotante descarta uma candidatura rejeitada."""
    app = db.query(AdoptionApplication).filter(AdoptionApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(app)
    db.commit()
    return None
