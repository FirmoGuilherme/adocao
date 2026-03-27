from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/shelters", tags=["shelters"])

@router.get("/{shelter_id}/stats")
def get_shelter_stats(shelter_id: int, db: Session = Depends(get_db)):
    shelter = db.query(models.User).filter(models.User.id == shelter_id, models.User.role == "shelter").first()
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found")
        
    total_pets = db.query(models.Pet).filter(models.Pet.shelter_name == shelter.name).count()
    available_pets = db.query(models.Pet).filter(models.Pet.shelter_name == shelter.name, models.Pet.status == "Available").count()
    adopted_pets = db.query(models.Pet).filter(models.Pet.shelter_name == shelter.name, models.Pet.status == "Adopted").count()
    
    return {
        "total_pets": total_pets,
        "available_pets": available_pets,
        "adopted_pets": adopted_pets,
        "pending_applications": 0, # Mocked for now
        "adoption_conversion_rate": "62%" # Mocked UI rule from prompt
    }

@router.get("/{shelter_id}/pets", response_model=List[schemas.Pet])
def get_shelter_pets(shelter_id: int, db: Session = Depends(get_db)):
    shelter = db.query(models.User).filter(models.User.id == shelter_id).first()
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found")
        
    return db.query(models.Pet).filter(models.Pet.shelter_name == shelter.name).all()

@router.post("/{shelter_id}/pets", response_model=schemas.Pet)
def add_pet(shelter_id: int, pet: schemas.PetCreate, db: Session = Depends(get_db)):
    shelter = db.query(models.User).filter(models.User.id == shelter_id).first()
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found")
    
    new_pet = models.Pet(**pet.model_dump())
    new_pet.shelter_name = shelter.name
    db.add(new_pet)
    db.commit()
    db.refresh(new_pet)
    return new_pet
