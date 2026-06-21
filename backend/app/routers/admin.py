from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
def get_platform_stats(db: Session = Depends(get_db)):
    """Get platform-wide statistics."""
    total_users = db.query(models.User).count()
    total_shelters = db.query(models.User).filter(models.User.role == "shelter").count()
    pending_shelters = db.query(models.User).filter(
        models.User.role == "shelter", models.User.approved == False
    ).count()
    total_pets = db.query(models.Pet).count()
    available_pets = db.query(models.Pet).filter(models.Pet.status == "Available").count()
    total_adoptions = db.query(models.Pet).filter(models.Pet.status == "Adopted").count()
    total_applications = db.query(models.AdoptionApplication).count()
    total_volunteers = db.query(models.User).filter(models.User.role == "volunteer").count()

    return {
        "total_users": total_users,
        "total_shelters": total_shelters,
        "pending_shelters": pending_shelters,
        "total_pets": total_pets,
        "available_pets": available_pets,
        "total_adoptions": total_adoptions,
        "total_applications": total_applications,
        "total_volunteers": total_volunteers
    }


@router.get("/shelters/pending")
def get_pending_shelters(db: Session = Depends(get_db)):
    """Get shelters awaiting approval."""
    shelters = db.query(models.User).filter(
        models.User.role == "shelter", models.User.approved == False
    ).all()
    return [
        {"id": s.id, "name": s.name, "email": s.email, "city": s.city, "state": s.state}
        for s in shelters
    ]


@router.get("/shelters/all")
def get_all_shelters(db: Session = Depends(get_db)):
    """Get all shelters with approval status."""
    shelters = db.query(models.User).filter(models.User.role == "shelter").all()
    return [
        {"id": s.id, "name": s.name, "email": s.email, "city": s.city, "state": s.state, "approved": s.approved}
        for s in shelters
    ]


@router.put("/shelters/{shelter_id}/approve")
def approve_shelter(shelter_id: int, db: Session = Depends(get_db)):
    """Approve a shelter registration."""
    shelter = db.query(models.User).filter(models.User.id == shelter_id, models.User.role == "shelter").first()
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found")
    shelter.approved = True
    db.commit()
    return {"id": shelter.id, "name": shelter.name, "approved": True}


@router.put("/shelters/{shelter_id}/reject")
def reject_shelter(shelter_id: int, db: Session = Depends(get_db)):
    """Reject a shelter registration (delete the user)."""
    shelter = db.query(models.User).filter(models.User.id == shelter_id, models.User.role == "shelter").first()
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found")
    db.delete(shelter)
    db.commit()
    return {"message": "Shelter rejected and removed."}


@router.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    """Get all users."""
    users = db.query(models.User).all()
    return [
        {"id": u.id, "name": u.name, "email": u.email, "city": u.city, "state": u.state, "role": u.role, "approved": u.approved}
        for u in users
    ]
