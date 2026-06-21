"""
Testes unitários e property-based tests para o endpoint /pets/{pet_id}/temperament.
Requirements: 2.5, 2.6, 2.11, 2.12, 2.13
"""
import asyncio

import pytest
from httpx import AsyncClient, ASGITransport
from hypothesis import given, settings, HealthCheck
from hypothesis import strategies as st
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from tests.conftest import VALID_PET_PAYLOAD, VALID_TEMPERAMENT_PAYLOAD

# ---------------------------------------------------------------------------
# Database setup for property tests (separate DB to avoid conflicts)
# ---------------------------------------------------------------------------

TEST_DATABASE_URL = "sqlite:///./test_pet_temperament_pbt.db"

pbt_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
PBTSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=pbt_engine)


def pbt_override_get_db():
    db = PBTSessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Unit tests - edge cases (using conftest setup_db fixture)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
class TestTemperamentPetNotFound:
    """Testes para pet_id inexistente → 404."""

    async def test_get_temperament_nonexistent_pet_returns_404(self, setup_db):
        """GET /pets/9999/temperament com pet inexistente retorna 404.
        Validates: Requirement 2.5
        """
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/pets/9999/temperament")

        assert response.status_code == 404
        assert response.json()["detail"] == "Pet not found"

    async def test_post_temperament_nonexistent_pet_returns_404(self, setup_db):
        """POST /pets/9999/temperament com pet inexistente retorna 404.
        Validates: Requirement 2.5
        """
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post(
                "/pets/9999/temperament", json=VALID_TEMPERAMENT_PAYLOAD
            )

        assert response.status_code == 404
        assert response.json()["detail"] == "Pet not found"

    async def test_put_temperament_nonexistent_pet_returns_404(self, setup_db):
        """PUT /pets/9999/temperament com pet inexistente retorna 404.
        Validates: Requirement 2.5
        """
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.put(
                "/pets/9999/temperament", json=VALID_TEMPERAMENT_PAYLOAD
            )

        assert response.status_code == 404
        assert response.json()["detail"] == "Pet not found"


@pytest.mark.asyncio
class TestTemperamentDuplicateProfile:
    """Testes para perfil duplicado → 409."""

    async def test_post_temperament_duplicate_returns_409(self, setup_db):
        """POST /pets/{pet_id}/temperament quando já existe perfil retorna 409.
        Validates: Requirement 2.5 (implied by 1:1 constraint)
        """
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            # Criar pet
            pet_resp = await client.post("/pets/", json=VALID_PET_PAYLOAD)
            pet_id = pet_resp.json()["id"]

            # Criar perfil de temperamento
            first_resp = await client.post(
                f"/pets/{pet_id}/temperament", json=VALID_TEMPERAMENT_PAYLOAD
            )
            assert first_resp.status_code == 201

            # Tentar criar novamente → 409
            second_resp = await client.post(
                f"/pets/{pet_id}/temperament", json=VALID_TEMPERAMENT_PAYLOAD
            )

        assert second_resp.status_code == 409
        assert "already exists" in second_resp.json()["detail"]


@pytest.mark.asyncio
class TestTemperamentPutNonexistentProfile:
    """Testes para PUT em perfil inexistente → 404."""

    async def test_put_temperament_no_profile_returns_404(self, setup_db):
        """PUT /pets/{pet_id}/temperament quando pet existe mas sem perfil retorna 404.
        Validates: Requirement 2.12
        """
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            # Criar pet sem perfil de temperamento
            pet_resp = await client.post("/pets/", json=VALID_PET_PAYLOAD)
            pet_id = pet_resp.json()["id"]

            # Tentar atualizar perfil inexistente → 404
            response = await client.put(
                f"/pets/{pet_id}/temperament", json=VALID_TEMPERAMENT_PAYLOAD
            )

        assert response.status_code == 404
        assert "not found" in response.json()["detail"]

    async def test_get_temperament_no_profile_returns_404(self, setup_db):
        """GET /pets/{pet_id}/temperament quando pet existe mas sem perfil retorna 404.
        Validates: Requirement 2.11
        """
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            # Criar pet sem perfil de temperamento
            pet_resp = await client.post("/pets/", json=VALID_PET_PAYLOAD)
            pet_id = pet_resp.json()["id"]

            # Buscar perfil inexistente → 404
            response = await client.get(f"/pets/{pet_id}/temperament")

        assert response.status_code == 404
        assert "not found" in response.json()["detail"]


# ---------------------------------------------------------------------------
# Property-based test strategies
# ---------------------------------------------------------------------------

LEVEL_FIELDS = [
    "energy_level",
    "sociability_people",
    "sociability_animals",
    "training_level",
    "independence_level",
    "playfulness",
    "noise_level",
]

# Valid level value (inside [1, 5])
level_st = st.integers(min_value=1, max_value=5)

# Invalid level value (outside [1, 5])
invalid_level_st = st.one_of(
    st.integers(max_value=0),
    st.integers(min_value=6),
)

# Valid behavior_notes (up to 2000 characters or None)
behavior_notes_st = st.one_of(
    st.none(),
    st.text(
        alphabet=st.characters(
            blacklist_categories=("Cs",),
            blacklist_characters="\x00",
        ),
        min_size=0,
        max_size=2000,
    ),
)

# behavior_notes exceeding 2000 characters
long_notes_st = st.text(
    alphabet=st.characters(blacklist_categories=("Cs",), blacklist_characters="\x00"),
    min_size=2001,
    max_size=2500,
)


@st.composite
def invalid_level_payload_st(draw):
    """Generate a temperament payload with at least one level field outside [1, 5]."""
    invalid_fields = draw(
        st.lists(
            st.sampled_from(LEVEL_FIELDS),
            min_size=1,
            max_size=len(LEVEL_FIELDS),
            unique=True,
        )
    )

    payload = {}
    for field in LEVEL_FIELDS:
        if field in invalid_fields:
            payload[field] = draw(invalid_level_st)
        else:
            payload[field] = draw(level_st)

    notes = draw(behavior_notes_st)
    if notes is not None:
        payload["behavior_notes"] = notes
    return payload


@st.composite
def invalid_notes_payload_st(draw):
    """Generate a temperament payload with valid levels but behavior_notes > 2000 chars."""
    payload = {}
    for field in LEVEL_FIELDS:
        payload[field] = draw(level_st)

    payload["behavior_notes"] = draw(long_notes_st)
    return payload


# Combined strategy: either invalid levels or invalid notes
invalid_temperament_payload_st = st.one_of(
    invalid_level_payload_st(),
    invalid_notes_payload_st(),
)


# ---------------------------------------------------------------------------
# Property 4: Temperament profile input validation rejects invalid data
# ---------------------------------------------------------------------------


@settings(
    max_examples=100,
    suppress_health_check=[HealthCheck.function_scoped_fixture],
    deadline=None,
)
@given(payload=invalid_temperament_payload_st)
def test_temperament_invalid_payload_returns_422(setup_db, payload):
    """
    Property 4: Temperament profile input validation rejects invalid data.

    For any temperament profile payload where at least one level field
    (energy_level, sociability_people, sociability_animals, training_level,
    independence_level, playfulness, noise_level) has a value outside [1, 5],
    or behavior_notes exceeds 2000 characters, the API shall reject the
    request with HTTP 422.

    **Validates: Requirements 2.6, 2.13**
    """
    # Use separate PBT engine to avoid conflicts with conftest engine
    app.dependency_overrides[get_db] = pbt_override_get_db
    Base.metadata.drop_all(bind=pbt_engine)
    Base.metadata.create_all(bind=pbt_engine)

    async def run():
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            # Create a pet first (required for the endpoint)
            pet_resp = await client.post("/pets/", json=VALID_PET_PAYLOAD)
            assert pet_resp.status_code == 201, (
                f"Failed to create pet: {pet_resp.status_code} {pet_resp.text}"
            )
            pet_id = pet_resp.json()["id"]

            # POST invalid temperament payload
            response = await client.post(
                f"/pets/{pet_id}/temperament", json=payload
            )
        assert response.status_code == 422, (
            f"Expected 422 for invalid temperament payload {payload}, "
            f"got {response.status_code}: {response.text}"
        )

    asyncio.get_event_loop().run_until_complete(run())
