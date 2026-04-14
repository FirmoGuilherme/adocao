"""
Testes unitários e de propriedade para POST /applications e GET /applications/user/{user_id}
Requisitos: 4.4, 4.5, 4.8
"""
import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from hypothesis import given, settings, HealthCheck
from hypothesis import strategies as st

from app.database import Base, get_db

TEST_DATABASE_URL = "sqlite:///./test_applications.db"

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


from app.main import app  # noqa: E402

# Set the override in a session-scoped fixture so it doesn't conflict with
# test_pets.py when running the full suite.
@pytest.fixture(autouse=True)
def setup_db():
    # Ensure this test file's DB override is active for every test in this module
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


VALID_APP_PAYLOAD = {
    "user_id": 1,
    "pet_id": 1,
    "housing_type": "apartment",
    "motivation": "Quero adotar um pet para fazer companhia.",
}


# ---------------------------------------------------------------------------
# Unit tests — Task 9.1
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_create_application_valid_payload_returns_201():
    """POST /applications com payload válido deve retornar 201 e status 'New'."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post("/applications/", json=VALID_APP_PAYLOAD)

    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["status"] == "New"
    assert data["user_id"] == VALID_APP_PAYLOAD["user_id"]
    assert data["pet_id"] == VALID_APP_PAYLOAD["pet_id"]
    assert data["housing_type"] == VALID_APP_PAYLOAD["housing_type"]
    assert data["motivation"] == VALID_APP_PAYLOAD["motivation"]


@pytest.mark.asyncio
async def test_create_application_missing_user_id_returns_422():
    """POST /applications sem 'user_id' deve retornar 422."""
    payload = {k: v for k, v in VALID_APP_PAYLOAD.items() if k != "user_id"}
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post("/applications/", json=payload)

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_application_missing_pet_id_returns_422():
    """POST /applications sem 'pet_id' deve retornar 422."""
    payload = {k: v for k, v in VALID_APP_PAYLOAD.items() if k != "pet_id"}
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post("/applications/", json=payload)

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_application_missing_housing_type_returns_422():
    """POST /applications sem 'housing_type' deve retornar 422."""
    payload = {k: v for k, v in VALID_APP_PAYLOAD.items() if k != "housing_type"}
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post("/applications/", json=payload)

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_application_missing_motivation_returns_422():
    """POST /applications sem 'motivation' deve retornar 422."""
    payload = {k: v for k, v in VALID_APP_PAYLOAD.items() if k != "motivation"}
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post("/applications/", json=payload)

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_user_applications_returns_created_application():
    """GET /applications/user/{user_id} deve retornar a candidatura criada."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        create_resp = await client.post("/applications/", json=VALID_APP_PAYLOAD)
        assert create_resp.status_code == 201

        get_resp = await client.get(f"/applications/user/{VALID_APP_PAYLOAD['user_id']}")

    assert get_resp.status_code == 200
    data = get_resp.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["status"] == "New"
    assert data[0]["user_id"] == VALID_APP_PAYLOAD["user_id"]


@pytest.mark.asyncio
async def test_get_user_applications_empty_for_unknown_user():
    """GET /applications/user/{user_id} para usuário sem candidaturas retorna lista vazia."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/applications/user/9999")

    assert response.status_code == 200
    assert response.json() == []


# ---------------------------------------------------------------------------
# Property-based test — Task 9.2
# Propriedade 4: Candidatura persiste com status inicial "New"
# Validates: Requirements 4.4, 4.8
# Tag: Feature: pet-adoption-core, Propriedade 4
# ---------------------------------------------------------------------------

text_st = st.text(
    alphabet=st.characters(blacklist_categories=("Cs",), blacklist_characters="\x00"),
    min_size=1,
    max_size=80,
)

housing_type_st = st.sampled_from(["apartment", "house", "farm", "condo"])

application_payload_st = st.fixed_dictionaries(
    {
        "user_id": st.integers(min_value=1, max_value=1000),
        "pet_id": st.integers(min_value=1, max_value=1000),
        "housing_type": housing_type_st,
        "motivation": text_st,
    }
)


# Validates: Requirements 4.4, 4.8
@settings(
    max_examples=100,
    suppress_health_check=[HealthCheck.function_scoped_fixture],
    deadline=None,
)
@given(payload=application_payload_st)
def test_application_persists_with_status_new(setup_db, payload):
    """
    Propriedade 4: Candidatura persiste com status inicial "New".

    Para qualquer candidatura criada via POST /applications com dados válidos,
    o campo `status` do objeto retornado deve ser "New", e a candidatura deve
    ser recuperável via GET /applications/user/{user_id}.

    Validates: Requirements 4.4, 4.8
    Tag: Feature: pet-adoption-core, Propriedade 4
    """
    # Reset DB between hypothesis examples to avoid cross-example contamination
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    _app = app  # capture module-level app to avoid closure scoping issues

    async def run():
        async with AsyncClient(
            transport=ASGITransport(app=_app), base_url="http://test"
        ) as client:
            # Create the application
            create_resp = await client.post("/applications/", json=payload)
            assert create_resp.status_code == 201, (
                f"Expected 201, got {create_resp.status_code}: {create_resp.text}"
            )
            created = create_resp.json()

            # Status must be "New" immediately after creation
            assert created["status"] == "New", (
                f"Expected status 'New', got {created['status']!r}"
            )

            # Retrieve via GET /applications/user/{user_id}
            get_resp = await client.get(f"/applications/user/{payload['user_id']}")
            assert get_resp.status_code == 200, (
                f"Expected 200, got {get_resp.status_code}: {get_resp.text}"
            )
            user_apps = get_resp.json()

        # The created application must appear in the user's list
        app_ids = [a["id"] for a in user_apps]
        assert created["id"] in app_ids, (
            f"Application id={created['id']} not found in user list: {app_ids}"
        )

        # All applications in the list for this user must have status "New"
        # (since we reset the DB each iteration, only the one we created exists)
        for application in user_apps:
            assert application["status"] == "New", (
                f"Application id={application['id']} has status {application['status']!r}, expected 'New'"
            )

    asyncio.get_event_loop().run_until_complete(run())
