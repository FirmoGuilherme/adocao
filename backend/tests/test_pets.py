"""
Testes unitários para POST /pets
Requisitos: 1.2, 1.3
"""
import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from hypothesis import given, settings, HealthCheck
from hypothesis import strategies as st

from app.database import Base, get_db

# SQLite in-memory test database — use a file-based in-memory URI so the same
# connection is reused across threads (needed because FastAPI runs sync routes
# in a thread pool).
TEST_DATABASE_URL = "sqlite:///./test_pets.db"

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


# Import app AFTER defining the override so the dependency is replaced before
# any request is processed.
from app.main import app  # noqa: E402

app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
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


@pytest.mark.asyncio
async def test_create_pet_valid_payload_returns_201():
    """POST /pets com payload válido deve retornar 201 e o objeto criado com id."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post("/pets/", json=VALID_PET_PAYLOAD)

    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["name"] == VALID_PET_PAYLOAD["name"]
    assert data["species"] == VALID_PET_PAYLOAD["species"]
    assert data["status"] == VALID_PET_PAYLOAD["status"]


@pytest.mark.asyncio
async def test_create_pet_returns_all_fields():
    """POST /pets deve retornar todos os campos do pet criado."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post("/pets/", json=VALID_PET_PAYLOAD)

    assert response.status_code == 201
    data = response.json()
    for field in VALID_PET_PAYLOAD:
        assert data[field] == VALID_PET_PAYLOAD[field]


@pytest.mark.asyncio
async def test_create_pet_missing_name_returns_422():
    """POST /pets sem campo 'name' deve retornar 422."""
    payload = {k: v for k, v in VALID_PET_PAYLOAD.items() if k != "name"}
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post("/pets/", json=payload)

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_pet_missing_species_returns_422():
    """POST /pets sem campo 'species' deve retornar 422."""
    payload = {k: v for k, v in VALID_PET_PAYLOAD.items() if k != "species"}
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post("/pets/", json=payload)

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_pet_missing_status_returns_422():
    """POST /pets sem campo 'status' deve retornar 422."""
    payload = {k: v for k, v in VALID_PET_PAYLOAD.items() if k != "status"}
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post("/pets/", json=payload)

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_pet_empty_body_returns_422():
    """POST /pets com body vazio deve retornar 422."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post("/pets/", json={})

    assert response.status_code == 422


# ---------------------------------------------------------------------------
# Property-based tests
# ---------------------------------------------------------------------------

# Strategies for valid enum values
species_st = st.sampled_from(["dog", "cat"])
age_group_st = st.sampled_from(["puppy", "young", "adult", "senior"])
size_st = st.sampled_from(["small", "medium", "large"])
sex_st = st.sampled_from(["male", "female"])
status_st = st.sampled_from(["Available", "Reserved", "Adopted"])

# Strategy for non-empty text fields (printable, no null bytes)
text_st = st.text(
    alphabet=st.characters(blacklist_categories=("Cs",), blacklist_characters="\x00"),
    min_size=1,
    max_size=50,
)

# Strategy for optional text (may be None or a short string)
optional_text_st = st.one_of(
    st.none(),
    st.text(
        alphabet=st.characters(blacklist_categories=("Cs",), blacklist_characters="\x00"),
        min_size=1,
        max_size=100,
    ),
)

pet_payload_st = st.fixed_dictionaries(
    {
        "name": text_st,
        "species": species_st,
        "breed": text_st,
        "age_group": age_group_st,
        "age_description": text_st,
        "size": size_st,
        "sex": sex_st,
        "color": text_st,
        "shelter_name": text_st,
        "city": text_st,
        "status": status_st,
        "description": optional_text_st,
        "is_vaccinated": st.booleans(),
        "is_neutered": st.booleans(),
        "good_with_kids": st.booleans(),
        "good_with_dogs": st.booleans(),
        "good_with_cats": st.booleans(),
        "apartment_friendly": st.booleans(),
        "first_time_owner_friendly": st.booleans(),
        "image_url": optional_text_st,
    }
)


# Validates: Requirements 1.2, 1.5, 3.1, 3.2
@settings(
    max_examples=100,
    suppress_health_check=[HealthCheck.function_scoped_fixture],
)
@given(payload=pet_payload_st)
def test_pet_round_trip(setup_db, payload):
    """
    Propriedade 2: Persistência e recuperação de pet (round-trip).

    Para qualquer pet criado via POST /pets, um subsequente GET /pets/{id}
    deve retornar um objeto equivalente ao que foi enviado na criação.

    Validates: Requirements 1.2, 1.5, 3.1, 3.2
    """
    async def run():
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            # Create the pet
            create_resp = await client.post("/pets/", json=payload)
            assert create_resp.status_code == 201, (
                f"Expected 201, got {create_resp.status_code}: {create_resp.text}"
            )
            created = create_resp.json()
            pet_id = created["id"]

            # Retrieve the pet
            get_resp = await client.get(f"/pets/{pet_id}")
            assert get_resp.status_code == 200, (
                f"Expected 200, got {get_resp.status_code}: {get_resp.text}"
            )
            retrieved = get_resp.json()

        # Verify round-trip equivalence for every field sent in the payload
        for field, value in payload.items():
            assert retrieved[field] == value, (
                f"Field '{field}': sent {value!r}, got {retrieved[field]!r}"
            )

        # The returned id must be a positive integer
        assert isinstance(retrieved["id"], int) and retrieved["id"] > 0

    asyncio.get_event_loop().run_until_complete(run())


# ---------------------------------------------------------------------------
# Property 5: Missing required fields generate validation error (HTTP 422)
# Validates: Requirements 1.3, 4.5
# ---------------------------------------------------------------------------

REQUIRED_FIELDS = [
    "name", "species", "breed", "age_group", "age_description",
    "size", "sex", "color", "shelter_name", "city", "status",
]

# Strategy: generate a non-empty subset of required fields to REMOVE
# (at least one field must always be missing)
fields_to_remove_st = st.lists(
    st.sampled_from(REQUIRED_FIELDS),
    min_size=1,
    max_size=len(REQUIRED_FIELDS),
    unique=True,
)


# Validates: Requirements 1.3, 4.5
@settings(
    max_examples=100,
    suppress_health_check=[HealthCheck.function_scoped_fixture],
)
@given(fields_to_remove=fields_to_remove_st)
def test_missing_required_fields_returns_422(setup_db, fields_to_remove):
    """
    Propriedade 5: Campos obrigatórios ausentes geram erro de validação.

    Para qualquer requisição POST /pets com pelo menos um campo obrigatório
    ausente, a API deve retornar HTTP 422.

    Validates: Requirements 1.3, 4.5
    """
    payload = {k: v for k, v in VALID_PET_PAYLOAD.items() if k not in fields_to_remove}

    async def run():
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post("/pets/", json=payload)
        assert response.status_code == 422, (
            f"Expected 422 when missing fields {fields_to_remove}, "
            f"got {response.status_code}: {response.text}"
        )

    asyncio.get_event_loop().run_until_complete(run())


# ---------------------------------------------------------------------------
# Property 1: Filtros retornam subconjunto consistente
# Validates: Requirements 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9
# Tag: Feature: pet-adoption-core, Propriedade 1
# ---------------------------------------------------------------------------

# Strategy for a single pet payload with all filter-relevant fields controlled
filter_pet_st = st.fixed_dictionaries(
    {
        "name": text_st,
        "species": species_st,
        "breed": text_st,
        "age_group": age_group_st,
        "age_description": text_st,
        "size": size_st,
        "sex": sex_st,
        "color": text_st,
        "shelter_name": text_st,
        "city": st.sampled_from(["São Paulo", "Rio de Janeiro", "Curitiba"]),
        "status": status_st,
        "good_with_kids": st.booleans(),
        "apartment_friendly": st.booleans(),
    }
)

# Strategy for a list of 1–10 pets
pets_list_st = st.lists(filter_pet_st, min_size=1, max_size=10)

# Strategy for a filter combination (each filter is either None or a valid value)
filter_combo_st = st.fixed_dictionaries(
    {
        "species": st.one_of(st.none(), species_st),
        "size": st.one_of(st.none(), size_st),
        "age_group": st.one_of(st.none(), age_group_st),
        "city": st.one_of(st.none(), st.sampled_from(["São Paulo", "Rio de Janeiro", "Curitiba"])),
        "apartment_friendly": st.one_of(st.none(), st.booleans()),
        "good_with_kids": st.one_of(st.none(), st.booleans()),
    }
)


def _pet_matches_filters(pet: dict, filters: dict) -> bool:
    """Return True if *pet* satisfies every non-None filter."""
    for key, value in filters.items():
        if value is None:
            continue
        if pet[key] != value:
            return False
    return True


# Validates: Requirements 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9
@settings(
    max_examples=50,
    suppress_health_check=[HealthCheck.function_scoped_fixture],
    deadline=None,
)
@given(pets=pets_list_st, filters=filter_combo_st)
def test_filter_returns_consistent_subset(setup_db, pets, filters):
    """
    Propriedade 1: Filtros retornam subconjunto consistente.

    Para qualquer conjunto de pets cadastrados e qualquer combinação de filtros
    válidos, todos os pets retornados pelo endpoint GET /pets devem satisfazer
    todos os filtros aplicados, e nenhum pet que satisfaça todos os filtros deve
    ser omitido da resposta.

    Validates: Requirements 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9
    """
    # Reset DB between hypothesis examples to avoid cross-example contamination
    from app.database import Base as _Base
    _Base.metadata.drop_all(bind=engine)
    _Base.metadata.create_all(bind=engine)

    async def run():
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            # Insert all pets
            created_pets = []
            for pet_payload in pets:
                resp = await client.post("/pets/", json=pet_payload)
                assert resp.status_code == 201, (
                    f"Failed to create pet: {resp.status_code} {resp.text}"
                )
                created_pets.append(resp.json())

            # Build query params — omit None values
            params = {k: v for k, v in filters.items() if v is not None}

            # Use a high limit to ensure all pets are returned
            params["limit"] = 1000

            # Call GET /pets with filters
            get_resp = await client.get("/pets/", params=params)
            assert get_resp.status_code == 200, (
                f"GET /pets failed: {get_resp.status_code} {get_resp.text}"
            )
            returned = get_resp.json()

        returned_ids = {p["id"] for p in returned}

        # Determine which of the pets we inserted should match the filters
        expected_ids = {
            p["id"]
            for p in created_pets
            if _pet_matches_filters(p, filters)
        }

        # 1) Every returned pet must satisfy all filters
        for pet in returned:
            for key, value in filters.items():
                if value is None:
                    continue
                assert pet[key] == value, (
                    f"Returned pet {pet['id']} has {key}={pet[key]!r} "
                    f"but filter requires {value!r}"
                )

        # 2) No eligible pet should be missing from the response
        missing = expected_ids - returned_ids
        assert not missing, (
            f"Pets {missing} satisfy all filters {params} but were not returned"
        )

    asyncio.get_event_loop().run_until_complete(run())

# ---------------------------------------------------------------------------
# Property 3: Pet inexistente retorna 404
# Validates: Requirement 3.3
# Tag: Feature: pet-adoption-core, Propriedade 3
# ---------------------------------------------------------------------------

# Strategy: positive integers as pet_id candidates (DB is empty, so any ID is non-existent)
pet_id_st = st.integers(min_value=1, max_value=10_000)


# Validates: Requirement 3.3
@settings(
    max_examples=50,
    suppress_health_check=[HealthCheck.function_scoped_fixture],
)
@given(pet_id=pet_id_st)
def test_nonexistent_pet_returns_404(setup_db, pet_id):
    """
    Propriedade 3: Pet inexistente retorna 404.

    Para qualquer pet_id que não exista no banco de dados (DB vazio),
    o endpoint GET /pets/{pet_id} deve retornar HTTP 404.

    Validates: Requirement 3.3
    Tag: Feature: pet-adoption-core, Propriedade 3
    """
    async def run():
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get(f"/pets/{pet_id}")
        assert response.status_code == 404, (
            f"Expected 404 for non-existent pet_id={pet_id}, "
            f"got {response.status_code}: {response.text}"
        )
        assert response.json() == {"detail": "Pet not found"}, (
            f"Expected detail 'Pet not found', got: {response.json()}"
        )

    asyncio.get_event_loop().run_until_complete(run())
