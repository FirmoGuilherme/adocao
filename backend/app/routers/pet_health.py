from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/pets", tags=["pet-health"])


def get_pet_or_404(pet_id: int, db: Session) -> models.Pet:
    pet = db.query(models.Pet).filter(models.Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet


@router.get("/{pet_id}/health", response_model=schemas.PetHealthRecordResponse)
def get_health_record(pet_id: int, db: Session = Depends(get_db)):
    get_pet_or_404(pet_id, db)
    record = db.query(models.PetHealthRecord).filter(
        models.PetHealthRecord.pet_id == pet_id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Health record not found for this pet")
    return record


@router.post("/{pet_id}/health", response_model=schemas.PetHealthRecordResponse, status_code=201)
def create_health_record(pet_id: int, data: schemas.PetHealthRecordCreate, db: Session = Depends(get_db)):
    get_pet_or_404(pet_id, db)
    existing = db.query(models.PetHealthRecord).filter(
        models.PetHealthRecord.pet_id == pet_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Health record already exists for this pet")
    record = models.PetHealthRecord(
        pet_id=pet_id,
        vaccination_records=[v.model_dump(mode="json") for v in data.vaccination_records],
        medical_conditions=[m.model_dump(mode="json") for m in data.medical_conditions],
        surgeries=[s.model_dump(mode="json") for s in data.surgeries],
        special_needs=data.special_needs,
        last_vet_visit=data.last_vet_visit,
        weight_kg=data.weight_kg,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.put("/{pet_id}/health", response_model=schemas.PetHealthRecordResponse)
def update_health_record(pet_id: int, data: schemas.PetHealthRecordCreate, db: Session = Depends(get_db)):
    get_pet_or_404(pet_id, db)
    record = db.query(models.PetHealthRecord).filter(
        models.PetHealthRecord.pet_id == pet_id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Health record not found for this pet")
    record.vaccination_records = [v.model_dump(mode="json") for v in data.vaccination_records]
    record.medical_conditions = [m.model_dump(mode="json") for m in data.medical_conditions]
    record.surgeries = [s.model_dump(mode="json") for s in data.surgeries]
    record.special_needs = data.special_needs
    record.last_vet_visit = data.last_vet_visit
    record.weight_kg = data.weight_kg
    db.commit()
    db.refresh(record)
    return record
