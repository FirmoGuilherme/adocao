"""
Fixtures compartilhadas para os testes de pet health, temperament e media.
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app

TEST_DATABASE_URL = "sqlite:///./test_edge_cases.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    """Cria e destrói as tabelas para cada teste."""
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


VALID_PET_PAYLOAD = {
    "name": "Rex",
    "species": "dog",
    "breed": "Labrador",
    "age_group": "adult",
    "age_description": "3 anos",
    "size": "large",
    "sex": "male",
    "color": "amarelo",
    "shelter_name": "Abrigo Esperança",
    "city": "São Paulo",
    "status": "Available",
}

VALID_HEALTH_PAYLOAD = {
    "vaccination_records": [
        {"vaccine_name": "V10", "date_administered": "2024-01-15"}
    ],
    "medical_conditions": [],
    "surgeries": [],
    "special_needs": None,
    "last_vet_visit": "2024-06-01",
    "weight_kg": 25.5,
}

VALID_TEMPERAMENT_PAYLOAD = {
    "energy_level": 4,
    "sociability_people": 5,
    "sociability_animals": 3,
    "training_level": 4,
    "independence_level": 2,
    "playfulness": 5,
    "noise_level": 3,
    "behavior_notes": "Brincalhão e amigável",
}
