from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, Text, DateTime, JSON
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=True)
    city = Column(String)
    state = Column(String)
    role = Column(String) # adopter, shelter, volunteer, admin
    avatar = Column(String, nullable=True)
    approved = Column(Boolean, default=True)  # shelters need admin approval

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


class AdoptionApplication(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    pet_id = Column(Integer, ForeignKey("pets.id"))
    status = Column(String, default="New")  # New, Screening, Interview, Approved, Rejected
    housing_type = Column(String)
    motivation = Column(Text)
    compatibility_score = Column(Float, default=85.0)


class PetHealthRecord(Base):
    __tablename__ = "pet_health_records"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey("pets.id"), unique=True, nullable=False, index=True)
    vaccination_records = Column(JSON, default=list)
    medical_conditions = Column(JSON, default=list)
    surgeries = Column(JSON, default=list)
    special_needs = Column(Text, nullable=True)
    last_vet_visit = Column(DateTime, nullable=True)
    weight_kg = Column(Float, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class PetTemperament(Base):
    __tablename__ = "pet_temperaments"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey("pets.id"), unique=True, nullable=False, index=True)
    energy_level = Column(Integer, nullable=False)
    sociability_people = Column(Integer, nullable=False)
    sociability_animals = Column(Integer, nullable=False)
    training_level = Column(Integer, nullable=False)
    independence_level = Column(Integer, nullable=False)
    playfulness = Column(Integer, nullable=False)
    noise_level = Column(Integer, nullable=False)
    behavior_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class PetMedia(Base):
    __tablename__ = "pet_media"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=False, index=True)
    media_type = Column(String, nullable=False)  # "photo" or "video"
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    url = Column(String, nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    uploaded_at = Column(DateTime, server_default=func.now())


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)

    # Personalidade do adotante/voluntário
    energy_level = Column(Integer, default=3)        # 1-5: calmo -> muito ativo
    social_level = Column(Integer, default=3)        # 1-5: introvertido -> extrovertido
    experience_level = Column(Integer, default=1)    # 1-5: nunca teve -> experiente
    patience_level = Column(Integer, default=3)      # 1-5: impaciente -> muito paciente
    outdoor_frequency = Column(Integer, default=3)   # 1-5: nunca sai -> todo dia

    # Preferências do pet (adotante)
    preferred_species = Column(String, nullable=True)  # dog, cat, any
    preferred_size = Column(String, nullable=True)     # small, medium, large, any
    preferred_energy = Column(Integer, default=3)      # 1-5
    preferred_age_group = Column(String, nullable=True)  # puppy, young, adult, senior, any
    accepts_special_needs = Column(Boolean, default=False)

    # Moradia e rotina
    housing_type = Column(String, nullable=True)
    has_yard = Column(Boolean, default=False)
    hours_alone = Column(Integer, default=8)  # horas que o pet ficaria sozinho
    has_other_pets = Column(Boolean, default=False)
    has_children = Column(Boolean, default=False)

    # Texto livre
    expectations = Column(Text, nullable=True)  # O que espera do companheiro animal

    # Voluntário - disponibilidade
    available_days = Column(String, nullable=True)  # "seg,ter,qua,qui,sex,sab,dom"
    available_hours = Column(String, nullable=True)  # "manha,tarde,noite"
    skills = Column(Text, nullable=True)  # habilidades especiais

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class VolunteerApplication(Base):
    """Voluntário se candidata a um abrigo, abrigo aprova/rejeita."""
    __tablename__ = "volunteer_applications"

    id = Column(Integer, primary_key=True, index=True)
    volunteer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    shelter_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status = Column(String, default="Pending")  # Pending, Approved, Rejected
    message = Column(Text, nullable=True)  # mensagem do voluntário
    created_at = Column(DateTime, server_default=func.now())


class VolunteerRating(Base):
    """Abrigo avalia voluntário com estrelas."""
    __tablename__ = "volunteer_ratings"

    id = Column(Integer, primary_key=True, index=True)
    volunteer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    shelter_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    stars = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
