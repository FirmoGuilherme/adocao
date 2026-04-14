from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class UserBase(BaseModel):
    name: str
    email: str
    city: str
    state: str
    role: str
    avatar: Optional[str] = None

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
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
