from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/{user_id}")
def get_profile(user_id: int, db: Session = Depends(get_db)):
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == user_id).first()
    if not profile:
        # Return default empty profile
        return {
            "user_id": user_id,
            "energy_level": 3, "social_level": 3, "experience_level": 1,
            "patience_level": 3, "outdoor_frequency": 3,
            "preferred_species": "any", "preferred_size": "any",
            "preferred_energy": 3, "preferred_age_group": "any",
            "accepts_special_needs": False,
            "housing_type": "", "has_yard": False, "hours_alone": 8,
            "has_other_pets": False, "has_children": False,
            "expectations": ""
        }
    return profile


@router.put("/{user_id}")
def update_profile(user_id: int, body: dict, db: Session = Depends(get_db)):
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == user_id).first()

    if not profile:
        profile = models.UserProfile(user_id=user_id)
        db.add(profile)

    # Update fields
    for field in [
        "energy_level", "social_level", "experience_level", "patience_level",
        "outdoor_frequency", "preferred_species", "preferred_size",
        "preferred_energy", "preferred_age_group", "accepts_special_needs",
        "housing_type", "has_yard", "hours_alone", "has_other_pets",
        "has_children", "expectations", "available_days", "available_hours", "skills"
    ]:
        if field in body:
            setattr(profile, field, body[field])

    db.commit()
    db.refresh(profile)
    return profile


@router.get("/{user_id}/compatibility/{pet_id}")
def get_compatibility_score(user_id: int, pet_id: int, db: Session = Depends(get_db)):
    """Calculate compatibility score between user profile and pet."""
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == user_id).first()
    pet = db.query(models.Pet).filter(models.Pet.id == pet_id).first()

    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    if not profile:
        return {"score": 75.0, "details": "Complete seu perfil para um score mais preciso."}

    # Get pet temperament if available
    temperament = db.query(models.PetTemperament).filter(models.PetTemperament.pet_id == pet_id).first()

    score = calculate_score(profile, pet, temperament)
    return {"score": round(score, 1), "details": "Score calculado com base no seu perfil."}


def calculate_score(profile: models.UserProfile, pet: models.Pet, temperament) -> float:
    """Calculate a 0-100 compatibility score."""
    points = 0
    max_points = 0

    # Species preference (20 points)
    max_points += 20
    if profile.preferred_species == "any" or profile.preferred_species == pet.species:
        points += 20

    # Size preference (15 points)
    max_points += 15
    if profile.preferred_size == "any" or profile.preferred_size == pet.size:
        points += 15

    # Age group preference (10 points)
    max_points += 10
    if profile.preferred_age_group == "any" or profile.preferred_age_group == pet.age_group:
        points += 10

    # Energy match (15 points) - compare user energy with pet energy
    max_points += 15
    if temperament:
        energy_diff = abs(profile.energy_level - temperament.energy_level)
        points += max(0, 15 - energy_diff * 4)
    else:
        points += 10  # neutral without temperament data

    # Social match (10 points)
    max_points += 10
    if temperament:
        social_diff = abs(profile.social_level - temperament.sociability_people)
        points += max(0, 10 - social_diff * 3)
    else:
        points += 7

    # Apartment compatibility (10 points)
    max_points += 10
    if profile.housing_type and "apartamento" in profile.housing_type.lower():
        if pet.apartment_friendly:
            points += 10
        else:
            points += 2
    else:
        points += 10  # house is fine for any pet

    # Children compatibility (10 points)
    max_points += 10
    if profile.has_children:
        if pet.good_with_kids:
            points += 10
        else:
            points += 3
    else:
        points += 10

    # Other pets compatibility (5 points)
    max_points += 5
    if profile.has_other_pets:
        if pet.good_with_dogs or pet.good_with_cats:
            points += 5
        else:
            points += 1
    else:
        points += 5

    # Experience vs training needed (5 points)
    max_points += 5
    if temperament:
        if profile.experience_level >= 3 or temperament.training_level >= 3:
            points += 5
        elif profile.experience_level < 2 and temperament.training_level < 2:
            points += 2
        else:
            points += 3
    else:
        if pet.first_time_owner_friendly or profile.experience_level >= 2:
            points += 5
        else:
            points += 3

    return (points / max_points) * 100 if max_points > 0 else 75.0
