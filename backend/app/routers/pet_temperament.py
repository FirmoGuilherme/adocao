from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/pets", tags=["temperament"])


def get_pet_or_404(pet_id: int, db: Session) -> models.Pet:
    pet = db.query(models.Pet).filter(models.Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet


@router.get("/{pet_id}/temperament", response_model=schemas.PetTemperamentResponse)
def get_temperament(pet_id: int, db: Session = Depends(get_db)):
    get_pet_or_404(pet_id, db)
    record = db.query(models.PetTemperament).filter(
        models.PetTemperament.pet_id == pet_id
    ).first()
    if not record:
        raise HTTPException(
            status_code=404,
            detail="Temperament profile not found for this pet",
        )
    return record


@router.post(
    "/{pet_id}/temperament",
    response_model=schemas.PetTemperamentResponse,
    status_code=201,
)
def create_temperament(
    pet_id: int,
    payload: schemas.PetTemperamentCreate,
    db: Session = Depends(get_db),
):
    get_pet_or_404(pet_id, db)
    existing = db.query(models.PetTemperament).filter(
        models.PetTemperament.pet_id == pet_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Temperament profile already exists for this pet",
        )
    record = models.PetTemperament(pet_id=pet_id, **payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.put("/{pet_id}/temperament", response_model=schemas.PetTemperamentResponse)
def update_temperament(
    pet_id: int,
    payload: schemas.PetTemperamentCreate,
    db: Session = Depends(get_db),
):
    get_pet_or_404(pet_id, db)
    record = db.query(models.PetTemperament).filter(
        models.PetTemperament.pet_id == pet_id
    ).first()
    if not record:
        raise HTTPException(
            status_code=404,
            detail="Temperament profile not found for this pet",
        )
    for field, value in payload.model_dump().items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record
