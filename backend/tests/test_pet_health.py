"""
Testes unitários e property-based tests para o endpoint /pets/{pet_id}/health.
Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9
"""
import pytest
import asyncio
from datetime import date
from httpx import AsyncClient, ASGITransport
from hypothesis import given, settings, HealthCheck
from hypothesis import strategies as st

from app.main import app
from app.database import Base
from tests.conftest import VALID_PET_PAYLOAD, VALID_HEALTH_PAYLOAD, engine


# ---------------------------------------------------------------------------
# Helper: create a pet and return its id
# ---------------------------------------------------------------------------
async def create_pet(client: AsyncClient) -> int:
    resp = await client.post("/pets/", json=VALID_PET_PAYLOAD)
    assert resp.status_code == 201
    return resp.json()["id"]


# ---------------------------------------------------------------------------
# Unit Tests: Edge cases
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
class TestHealthPetNotFound:
    """Testes para pet_id inexistente → 404."""

    async def test_get_health_nonexistent_pet_returns_404(self, setup_db):
        """GET /pets/9999/health com pet inexistente retorna 404.
        Validates: Requirement 1.5
        """
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/pets/9999/health")

        assert response.status_code == 404
        assert response.json()["detail"] == "Pet not found"

    async def test_post_health_nonexistent_pet_returns_404(self, setup_db):
        """POST /pets/9999/health com pet inexistente retorna 404.
        Validates: Requirement 1.5
        """
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post("/pets/9999/health", json=VALID_HEALTH_PAYLOAD)

        assert response.status_code == 404
        assert response.json()["detail"] == "Pet not found"

    async def test_put_health_nonexistent_pet_returns_404(self, setup_db):
        """PUT /pets/9999/health com pet inexistente retorna 404.
        Validates: Requirement 1.5
        """
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.put("/pets/9999/health", json=VALID_HEALTH_PAYLOAD)

        assert response.status_code == 404
        assert response.json()["detail"] == "Pet not found"


@pytest.mark.asyncio
class TestHealthDuplicateRecord:
    """Testes para registro duplicado → 409."""

    async def test_post_health_duplicate_returns_409(self, setup_db):
        """POST /pets/{pet_id}/health quando já existe registro retorna 409.
        Validates: Requirement 1.9
        """
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            # Criar pet
            pet_resp = await client.post("/pets/", json=VALID_PET_PAYLOAD)
            pet_id = pet_resp.json()["id"]

            # Criar registro de saúde
            first_resp = await client.post(
                f"/pets/{pet_id}/health", json=VALID_HEALTH_PAYLOAD
            )
            assert first_resp.status_code == 201

            # Tentar criar novamente → 409
            second_resp = await client.post(
                f"/pets/{pet_id}/health", json=VALID_HEALTH_PAYLOAD
            )

        assert second_resp.status_code == 409
        assert "already exists" in second_resp.json()["detail"]


@pytest.mark.asyncio
class TestHealthPutNonexistentRecord:
    """Testes para PUT em registro inexistente → 404."""

    async def test_put_health_no_record_returns_404(self, setup_db):
        """PUT /pets/{pet_id}/health quando pet existe mas sem registro retorna 404.
        Validates: Requirement 1.8
        """
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            # Criar pet sem registro de saúde
            pet_resp = await client.post("/pets/", json=VALID_PET_PAYLOAD)
            pet_id = pet_resp.json()["id"]

            # Tentar atualizar registro inexistente → 404
            response = await client.put(
                f"/pets/{pet_id}/health", json=VALID_HEALTH_PAYLOAD
            )

        assert response.status_code == 404
        assert "not found" in response.json()["detail"]

    async def test_get_health_no_record_returns_404(self, setup_db):
        """GET /pets/{pet_id}/health quando pet existe mas sem registro retorna 404.
        Validates: Requirement 1.6
        """
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            # Criar pet sem registro de saúde
            pet_resp = await client.post("/pets/", json=VALID_PET_PAYLOAD)
            pet_id = pet_resp.json()["id"]

            # Buscar registro inexistente → 404
            response = await client.get(f"/pets/{pet_id}/health")

        assert response.status_code == 404
        assert "not found" in response.json()["detail"]


# ---------------------------------------------------------------------------
# Property 1: Health record serialization round-trip
# ---------------------------------------------------------------------------

# Strategies for generating valid health record data

# Valid vaccination record: vaccine_name (non-empty) + date_administered (required)
# optionally expiry_date
valid_vaccination_record_st = st.fixed_dictionaries(
    {
        "vaccine_name": st.text(
            alphabet=st.characters(blacklist_categories=("Cs",), blacklist_characters="\x00"),
            min_size=1,
            max_size=50,
        ),
        "date_administered": st.dates(
            min_value=date(2000, 1, 1),
            max_value=date(2030, 12, 31),
        ).map(lambda d: d.isoformat()),
    },
    optional={
        "expiry_date": st.dates(
            min_value=date(2000, 1, 1),
            max_value=date(2035, 12, 31),
        ).map(lambda d: d.isoformat()),
    },
)

# Valid medical condition
valid_medical_condition_st = st.fixed_dictionaries(
    {
        "condition_name": st.text(
            alphabet=st.characters(blacklist_categories=("Cs",), blacklist_characters="\x00"),
            min_size=1,
            max_size=50,
        ),
    },
    optional={
        "diagnosed_date": st.dates(
            min_value=date(2000, 1, 1),
            max_value=date(2030, 12, 31),
        ).map(lambda d: d.isoformat()),
        "notes": st.text(
            alphabet=st.characters(blacklist_categories=("Cs",), blacklist_characters="\x00"),
            min_size=1,
            max_size=200,
        ),
    },
)

# Valid surgery
valid_surgery_st = st.fixed_dictionaries(
    {
        "surgery_name": st.text(
            alphabet=st.characters(blacklist_categories=("Cs",), blacklist_characters="\x00"),
            min_size=1,
            max_size=50,
        ),
        "surgery_date": st.dates(
            min_value=date(2000, 1, 1),
            max_value=date(2030, 12, 31),
        ).map(lambda d: d.isoformat()),
    },
    optional={
        "description": st.text(
            alphabet=st.characters(blacklist_categories=("Cs",), blacklist_characters="\x00"),
            min_size=1,
            max_size=200,
        ),
    },
)

# Valid special_needs: optional text up to 2000 characters
valid_special_needs_st = st.one_of(
    st.none(),
    st.text(
        alphabet=st.characters(blacklist_categories=("Cs",), blacklist_characters="\x00"),
        min_size=1,
        max_size=2000,
    ),
)

# Valid weight_kg: between 0.01 and 200.00 or None
valid_weight_kg_st = st.one_of(
    st.none(),
    st.floats(min_value=0.01, max_value=200.00, allow_nan=False, allow_infinity=False),
)

# Valid last_vet_visit: optional date
valid_last_vet_visit_st = st.one_of(
    st.none(),
    st.dates(min_value=date(2000, 1, 1), max_value=date(2030, 12, 31)).map(lambda d: d.isoformat()),
)


@st.composite
def valid_health_record_st(draw):
    """Generate a valid health record payload for Property 1 round-trip test."""
    vaccination_records = draw(
        st.lists(valid_vaccination_record_st, min_size=0, max_size=5)
    )
    medical_conditions = draw(
        st.lists(valid_medical_condition_st, min_size=0, max_size=3)
    )
    surgeries = draw(
        st.lists(valid_surgery_st, min_size=0, max_size=3)
    )
    special_needs = draw(valid_special_needs_st)
    weight_kg = draw(valid_weight_kg_st)
    last_vet_visit = draw(valid_last_vet_visit_st)

    payload = {
        "vaccination_records": vaccination_records,
        "medical_conditions": medical_conditions,
        "surgeries": surgeries,
    }
    if special_needs is not None:
        payload["special_needs"] = special_needs
    if weight_kg is not None:
        payload["weight_kg"] = round(weight_kg, 2)
    if last_vet_visit is not None:
        payload["last_vet_visit"] = last_vet_visit

    return payload


# Validates: Requirements 1.2, 1.3, 1.4, 1.7
@settings(
    max_examples=100,
    suppress_health_check=[HealthCheck.function_scoped_fixture],
    deadline=None,
)
@given(payload=valid_health_record_st())
def test_health_record_serialization_round_trip(setup_db, payload):
    """
    Property 1: Health record serialization round-trip.

    For any valid health record data (with vaccination records containing
    vaccine_name and date_administered, weight_kg between 0.01 and 200.00,
    special_needs <= 2000 chars), creating the record via POST and then
    retrieving it via GET should return data equivalent to the original input
    for all persisted fields.

    **Validates: Requirements 1.2, 1.3, 1.4, 1.7**
    """
    # Reset DB between hypothesis examples to avoid cross-example contamination
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    async def run():
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            # Create a pet first
            pet_id = await create_pet(client)

            # POST health record
            create_resp = await client.post(f"/pets/{pet_id}/health", json=payload)
            assert create_resp.status_code == 201, (
                f"Expected 201, got {create_resp.status_code}: {create_resp.text}"
            )

            # GET health record
            get_resp = await client.get(f"/pets/{pet_id}/health")
            assert get_resp.status_code == 200, (
                f"Expected 200, got {get_resp.status_code}: {get_resp.text}"
            )
            retrieved = get_resp.json()

        # Verify round-trip: all fields sent in payload should match in response
        # Check vaccination_records
        sent_vaccinations = payload.get("vaccination_records", [])
        retrieved_vaccinations = retrieved["vaccination_records"]
        assert len(retrieved_vaccinations) == len(sent_vaccinations), (
            f"vaccination_records count mismatch: sent {len(sent_vaccinations)}, "
            f"got {len(retrieved_vaccinations)}"
        )
        for i, (sent, got) in enumerate(zip(sent_vaccinations, retrieved_vaccinations)):
            assert got["vaccine_name"] == sent["vaccine_name"], (
                f"vaccination_records[{i}].vaccine_name: sent {sent['vaccine_name']!r}, got {got['vaccine_name']!r}"
            )
            assert got["date_administered"] == sent["date_administered"], (
                f"vaccination_records[{i}].date_administered: sent {sent['date_administered']!r}, got {got['date_administered']!r}"
            )
            sent_expiry = sent.get("expiry_date")
            got_expiry = got.get("expiry_date")
            assert got_expiry == sent_expiry, (
                f"vaccination_records[{i}].expiry_date: sent {sent_expiry!r}, got {got_expiry!r}"
            )

        # Check medical_conditions
        sent_conditions = payload.get("medical_conditions", [])
        retrieved_conditions = retrieved["medical_conditions"]
        assert len(retrieved_conditions) == len(sent_conditions), (
            f"medical_conditions count mismatch: sent {len(sent_conditions)}, "
            f"got {len(retrieved_conditions)}"
        )
        for i, (sent, got) in enumerate(zip(sent_conditions, retrieved_conditions)):
            assert got["condition_name"] == sent["condition_name"], (
                f"medical_conditions[{i}].condition_name mismatch"
            )
            assert got.get("diagnosed_date") == sent.get("diagnosed_date"), (
                f"medical_conditions[{i}].diagnosed_date mismatch"
            )
            assert got.get("notes") == sent.get("notes"), (
                f"medical_conditions[{i}].notes mismatch"
            )

        # Check surgeries
        sent_surgeries = payload.get("surgeries", [])
        retrieved_surgeries = retrieved["surgeries"]
        assert len(retrieved_surgeries) == len(sent_surgeries), (
            f"surgeries count mismatch: sent {len(sent_surgeries)}, "
            f"got {len(retrieved_surgeries)}"
        )
        for i, (sent, got) in enumerate(zip(sent_surgeries, retrieved_surgeries)):
            assert got["surgery_name"] == sent["surgery_name"], (
                f"surgeries[{i}].surgery_name mismatch"
            )
            assert got["surgery_date"] == sent["surgery_date"], (
                f"surgeries[{i}].surgery_date mismatch"
            )
            assert got.get("description") == sent.get("description"), (
                f"surgeries[{i}].description mismatch"
            )

        # Check special_needs
        sent_special_needs = payload.get("special_needs")
        retrieved_special_needs = retrieved.get("special_needs")
        assert retrieved_special_needs == sent_special_needs, (
            f"special_needs: sent {sent_special_needs!r}, got {retrieved_special_needs!r}"
        )

        # Check weight_kg (compare with tolerance for float precision)
        sent_weight = payload.get("weight_kg")
        retrieved_weight = retrieved.get("weight_kg")
        if sent_weight is None:
            assert retrieved_weight is None, (
                f"weight_kg: sent None, got {retrieved_weight!r}"
            )
        else:
            assert retrieved_weight is not None, (
                f"weight_kg: sent {sent_weight!r}, got None"
            )
            assert abs(retrieved_weight - sent_weight) < 0.01, (
                f"weight_kg: sent {sent_weight}, got {retrieved_weight}"
            )

        # Check last_vet_visit
        sent_last_vet = payload.get("last_vet_visit")
        retrieved_last_vet = retrieved.get("last_vet_visit")
        assert retrieved_last_vet == sent_last_vet, (
            f"last_vet_visit: sent {sent_last_vet!r}, got {retrieved_last_vet!r}"
        )

        # Verify response includes metadata fields
        assert "id" in retrieved and isinstance(retrieved["id"], int)
        assert "pet_id" in retrieved and retrieved["pet_id"] == pet_id
        assert "created_at" in retrieved
        assert "updated_at" in retrieved

    asyncio.get_event_loop().run_until_complete(run())
