from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import date, datetime

class UserBase(BaseModel):
    name: str
    email: str
    city: str
    state: str
    role: str
    avatar: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    approved: Optional[bool] = True
    model_config = ConfigDict(from_attributes=True)

class PetBase(BaseModel):
    name: str
    species: str
    breed: str
    age_group: str
    age_description: str
    size: str
    sex: str
    color: str
    shelter_name: str
    city: str
    status: str
    description: Optional[str] = None
    is_vaccinated: bool = True
    is_neutered: bool = True
    good_with_kids: bool = False
    good_with_dogs: bool = False
    good_with_cats: bool = False
    apartment_friendly: bool = False
    first_time_owner_friendly: bool = False
    image_url: Optional[str] = None

class PetCreate(PetBase):
    pass

class Pet(PetBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class ApplicationCreate(BaseModel):
    user_id: int
    pet_id: int
    housing_type: str
    motivation: str

class ApplicationResponse(ApplicationCreate):
    id: int
    status: str
    compatibility_score: float
    model_config = ConfigDict(from_attributes=True)


# --- Pet Health Record Schemas ---

class VaccinationRecord(BaseModel):
    vaccine_name: str
    date_administered: date
    expiry_date: Optional[date] = None


class MedicalCondition(BaseModel):
    condition_name: str
    diagnosed_date: Optional[date] = None
    notes: Optional[str] = None


class Surgery(BaseModel):
    surgery_name: str
    surgery_date: date
    description: Optional[str] = None


class PetHealthRecordCreate(BaseModel):
    vaccination_records: List[VaccinationRecord] = Field(default=[], max_length=100)
    medical_conditions: List[MedicalCondition] = Field(default=[], max_length=50)
    surgeries: List[Surgery] = Field(default=[], max_length=50)
    special_needs: Optional[str] = Field(default=None, max_length=2000)
    last_vet_visit: Optional[date] = None
    weight_kg: Optional[float] = Field(default=None, ge=0.01, le=200.00)


class PetHealthRecordResponse(PetHealthRecordCreate):
    id: int
    pet_id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# --- Pet Temperament Schemas ---

class PetTemperamentCreate(BaseModel):
    energy_level: int = Field(..., ge=1, le=5)
    sociability_people: int = Field(..., ge=1, le=5)
    sociability_animals: int = Field(..., ge=1, le=5)
    training_level: int = Field(..., ge=1, le=5)
    independence_level: int = Field(..., ge=1, le=5)
    playfulness: int = Field(..., ge=1, le=5)
    noise_level: int = Field(..., ge=1, le=5)
    behavior_notes: Optional[str] = Field(default=None, max_length=2000)


class PetTemperamentResponse(PetTemperamentCreate):
    id: int
    pet_id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# --- Pet Media Schemas ---

class PetMediaResponse(BaseModel):
    id: int
    pet_id: int
    media_type: str
    file_name: str
    url: str
    uploaded_at: datetime
    model_config = ConfigDict(from_attributes=True)
