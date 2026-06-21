from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func as sql_func
from typing import List
from ..database import get_db
from .. import models

router = APIRouter(prefix="/volunteers", tags=["volunteers"])


@router.post("/apply")
def apply_to_shelter(body: dict, db: Session = Depends(get_db)):
    """Voluntário se candidata a um abrigo."""
    volunteer_id = body.get("volunteer_id")
    shelter_id = body.get("shelter_id")
    message = body.get("message", "")

    if not volunteer_id or not shelter_id:
        raise HTTPException(status_code=400, detail="volunteer_id and shelter_id required")

    # Check if already applied
    existing = db.query(models.VolunteerApplication).filter(
        models.VolunteerApplication.volunteer_id == volunteer_id,
        models.VolunteerApplication.shelter_id == shelter_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Já se candidatou a este abrigo")

    app = models.VolunteerApplication(
        volunteer_id=volunteer_id,
        shelter_id=shelter_id,
        status="Pending",
        message=message
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


@router.get("/applications/{volunteer_id}")
def get_volunteer_applications(volunteer_id: int, db: Session = Depends(get_db)):
    """Get all applications for a volunteer."""
    apps = db.query(models.VolunteerApplication).filter(
        models.VolunteerApplication.volunteer_id == volunteer_id
    ).all()
    results = []
    for app in apps:
        shelter = db.query(models.User).filter(models.User.id == app.shelter_id).first()
        results.append({
            "id": app.id,
            "shelter_id": app.shelter_id,
            "shelter_name": shelter.name if shelter else "Desconhecido",
            "shelter_city": shelter.city if shelter else "",
            "shelter_state": shelter.state if shelter else "",
            "status": app.status,
            "message": app.message,
            "created_at": str(app.created_at) if app.created_at else None
        })
    return results


@router.get("/shelter/{shelter_id}/pending")
def get_shelter_volunteer_applications(shelter_id: int, db: Session = Depends(get_db)):
    """Get pending volunteer applications for a shelter."""
    apps = db.query(models.VolunteerApplication).filter(
        models.VolunteerApplication.shelter_id == shelter_id
    ).all()
    results = []
    for app in apps:
        volunteer = db.query(models.User).filter(models.User.id == app.volunteer_id).first()
        # Get average rating
        avg = db.query(sql_func.avg(models.VolunteerRating.stars)).filter(
            models.VolunteerRating.volunteer_id == app.volunteer_id
        ).scalar()
        results.append({
            "id": app.id,
            "volunteer_id": app.volunteer_id,
            "volunteer_name": volunteer.name if volunteer else "Desconhecido",
            "volunteer_email": volunteer.email if volunteer else "",
            "status": app.status,
            "message": app.message,
            "average_rating": round(float(avg), 1) if avg else None,
            "created_at": str(app.created_at) if app.created_at else None
        })
    return results


@router.put("/applications/{app_id}/status")
def update_volunteer_application_status(app_id: int, body: dict, db: Session = Depends(get_db)):
    """Shelter approves or rejects a volunteer application."""
    app = db.query(models.VolunteerApplication).filter(models.VolunteerApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app.status = body.get("status", app.status)
    db.commit()
    db.refresh(app)
    return {"id": app.id, "status": app.status}


@router.post("/rate")
def rate_volunteer(body: dict, db: Session = Depends(get_db)):
    """Shelter rates a volunteer."""
    volunteer_id = body.get("volunteer_id")
    shelter_id = body.get("shelter_id")
    stars = body.get("stars")
    comment = body.get("comment", "")

    if not volunteer_id or not shelter_id or not stars:
        raise HTTPException(status_code=400, detail="volunteer_id, shelter_id, and stars required")
    if stars < 1 or stars > 5:
        raise HTTPException(status_code=400, detail="Stars must be between 1 and 5")

    rating = models.VolunteerRating(
        volunteer_id=volunteer_id,
        shelter_id=shelter_id,
        stars=stars,
        comment=comment
    )
    db.add(rating)
    db.commit()
    db.refresh(rating)
    return rating


@router.get("/rating/{volunteer_id}")
def get_volunteer_rating(volunteer_id: int, db: Session = Depends(get_db)):
    """Get average rating and all reviews for a volunteer."""
    ratings = db.query(models.VolunteerRating).filter(
        models.VolunteerRating.volunteer_id == volunteer_id
    ).all()

    if not ratings:
        return {"average": None, "total_reviews": 0, "ratings": []}

    avg = sum(r.stars for r in ratings) / len(ratings)
    return {
        "average": round(avg, 1),
        "total_reviews": len(ratings),
        "ratings": [
            {"stars": r.stars, "comment": r.comment, "shelter_id": r.shelter_id, "created_at": str(r.created_at)}
            for r in ratings
        ]
    }
