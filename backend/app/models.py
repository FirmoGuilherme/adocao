from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    city = Column(String)
    state = Column(String)
    role = Column(String) # adopter, shelter, volunteer, admin
    avatar = Column(String, nullable=True)

class Pet(Base):
    __tablename__ = "pets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    species = Column(String) # dog, cat
    breed = Column(String)
    age_group = Column(String) # puppy, young, adult, senior
    age_description = Column(String)
    size = Column(String) # small, medium, large
    sex = Column(String)
    color = Column(String)
    shelter_name = Column(String)
    city = Column(String)
    status = Column(String) # Available, Reserved, Adopted
    description = Column(Text, nullable=True)
    
    # Flags
    is_vaccinated = Column(Boolean, default=True)
    is_neutered = Column(Boolean, default=True)
    good_with_kids = Column(Boolean, default=False)
    good_with_dogs = Column(Boolean, default=False)
    good_with_cats = Column(Boolean, default=False)
    apartment_friendly = Column(Boolean, default=False)
    first_time_owner_friendly = Column(Boolean, default=False)
    image_url = Column(String, nullable=True)
