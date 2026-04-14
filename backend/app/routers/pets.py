from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/pets", tags=["pets"])

@router.get("/", response_model=List[schemas.Pet])
def get_pets(
    skip: int = 0, limit: int = 100, 
    species: Optional[str] = None,
    size: Optional[str] = None,
    age_group: Optional[str] = None,
    city: Optional[str] = None,
    apartment_friendly: Optional[bool] = None,
    good_with_kids: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Pet)
    if species: query = query.filter(models.Pet.species == species)
    if size: query = query.filter(models.Pet.size == size)
    if age_group: query = query.filter(models.Pet.age_group == age_group)
    if city: query = query.filter(models.Pet.city == city)
    if apartment_friendly is not None: query = query.filter(models.Pet.apartment_friendly == apartment_friendly)
    if good_with_kids is not None: query = query.filter(models.Pet.good_with_kids == good_with_kids)
    
    return query.offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.Pet, status_code=201)
def create_pet(pet: schemas.PetCreate, db: Session = Depends(get_db)):
    db_pet = models.Pet(**pet.model_dump())
    db.add(db_pet)
    db.commit()
    db.refresh(db_pet)
    return db_pet

@router.get("/{pet_id}", response_model=schemas.Pet)
def get_pet(pet_id: int, db: Session = Depends(get_db)):
    pet = db.query(models.Pet).filter(models.Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet
