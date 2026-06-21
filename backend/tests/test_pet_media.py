"""
Testes unitários para edge cases do endpoint /pets/{pet_id}/media.
Requirements: 3.5, 3.6, 3.11, 3.12, 3.17, 3.18, 3.19
"""
import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.routers.pet_media import get_file_storage
from tests.conftest import VALID_PET_PAYLOAD

# Use an ASCII-safe shelter name for media tests (HTTP headers require ASCII)
MEDIA_PET_PAYLOAD = {**VALID_PET_PAYLOAD, "shelter_name": "Abrigo Esperanca"}
SHELTER_NAME = "Abrigo Esperanca"


def mock_file_storage():
    """Mock do FileStorageService para testes."""
    mock = MagicMock()
    mock.save_file.return_value = "pets/1/fake-uuid.jpg"
    mock.get_url.return_value = "/static/uploads/pets/1/fake-uuid.jpg"
    mock.delete_file.return_value = None
    return mock


@pytest.fixture(autouse=True)
def override_storage():
    """Override do FileStorageService em todos os testes de media."""
    mock = mock_file_storage()
    app.dependency_overrides[get_file_storage] = lambda: mock
    yield mock
    app.dependency_overrides.pop(get_file_storage, None)


@pytest.mark.asyncio
class TestMediaPetNotFound:
    """Testes para pet_id inexistente → 404."""

    async def test_post_media_nonexistent_pet_returns_404(self, setup_db):
        """POST /pets/9999/media com pet inexistente retorna 404.
        Validates: Requirement 3.11
        """
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post(
                "/pets/9999/media",
                files={"file": ("photo.jpg", b"fake image content", "image/jpeg")},
                headers={"X-Shelter-Name": SHELTER_NAME},
            )

        assert response.status_code == 404
        assert response.json()["detail"] == "Pet not found"


@pytest.mark.asyncio
class TestMediaUnauthorized:
    """Testes para cuidador não autorizado → 403."""

    async def test_post_media_wrong_shelter_returns_403(self, setup_db):
        """POST /pets/{pet_id}/media com shelter_name diferente retorna 403.
        Validates: Requirement 3.17
        """
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            # Criar pet com shelter_name específico
            pet_resp = await client.post("/pets/", json=MEDIA_PET_PAYLOAD)
            pet_id = pet_resp.json()["id"]

            # Tentar upload com shelter_name errado
            response = await client.post(
                f"/pets/{pet_id}/media",
                files={"file": ("photo.jpg", b"fake image content", "image/jpeg")},
                headers={"X-Shelter-Name": "Outro Abrigo"},
            )

        assert response.status_code == 403
        assert "not authorized" in response.json()["detail"]

    async def test_post_media_missing_shelter_header_returns_403(self, setup_db):
        """POST /pets/{pet_id}/media sem header X-Shelter-Name retorna 403.
        Validates: Requirement 3.17
        """
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            # Criar pet
            pet_resp = await client.post("/pets/", json=MEDIA_PET_PAYLOAD)
            pet_id = pet_resp.json()["id"]

            # Tentar upload sem header
            response = await client.post(
                f"/pets/{pet_id}/media",
                files={"file": ("photo.jpg", b"fake image content", "image/jpeg")},
            )

        assert response.status_code == 403
        assert "not authorized" in response.json()["detail"]


@pytest.mark.asyncio
class TestMediaEmptyFile:
    """Testes para arquivo vazio → 422."""

    async def test_post_media_empty_file_returns_422(self, setup_db):
        """POST /pets/{pet_id}/media com arquivo de 0 bytes retorna 422.
        Validates: Requirement 3.18
        """
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            pet_resp = await client.post("/pets/", json=MEDIA_PET_PAYLOAD)
            pet_id = pet_resp.json()["id"]

            response = await client.post(
                f"/pets/{pet_id}/media",
                files={"file": ("photo.jpg", b"", "image/jpeg")},
                headers={"X-Shelter-Name": SHELTER_NAME},
            )

        assert response.status_code == 422
        assert "empty" in response.json()["detail"].lower()


@pytest.mark.asyncio
class TestMediaMissingFile:
    """Testes para campo de arquivo ausente → 422."""

    async def test_post_media_no_file_field_returns_422(self, setup_db):
        """POST /pets/{pet_id}/media sem campo file retorna 422.
        Validates: Requirement 3.19
        """
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            pet_resp = await client.post("/pets/", json=MEDIA_PET_PAYLOAD)
            pet_id = pet_resp.json()["id"]

            # Enviar POST sem arquivo (apenas com header correto)
            response = await client.post(
                f"/pets/{pet_id}/media",
                headers={"X-Shelter-Name": SHELTER_NAME},
            )

        assert response.status_code == 422


@pytest.mark.asyncio
class TestMediaLimitReached:
    """Testes para limite de 20 mídias → 409."""

    async def test_post_media_limit_20_returns_409(self, setup_db):
        """POST /pets/{pet_id}/media quando já existem 20 mídias retorna 409.
        Validates: Requirement 3.12
        """
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            pet_resp = await client.post("/pets/", json=MEDIA_PET_PAYLOAD)
            pet_id = pet_resp.json()["id"]

            # Criar 20 mídias
            for i in range(20):
                resp = await client.post(
                    f"/pets/{pet_id}/media",
                    files={
                        "file": (
                            f"photo_{i}.jpg",
                            b"x" * 100,
                            "image/jpeg",
                        )
                    },
                    headers={"X-Shelter-Name": SHELTER_NAME},
                )
                assert resp.status_code == 201, (
                    f"Upload {i+1} failed: {resp.status_code} {resp.text}"
                )

            # Upload 21 deve falhar → 409
            response = await client.post(
                f"/pets/{pet_id}/media",
                files={"file": ("photo_21.jpg", b"x" * 100, "image/jpeg")},
                headers={"X-Shelter-Name": SHELTER_NAME},
            )

        assert response.status_code == 409
        assert "20" in response.json()["detail"]


@pytest.mark.asyncio
class TestMediaImageTooLarge:
    """Testes para imagem > 10MB → 413."""

    async def test_post_media_image_exceeds_10mb_returns_413(self, setup_db):
        """POST /pets/{pet_id}/media com imagem > 10MB retorna 413.
        Validates: Requirement 3.5
        """
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            pet_resp = await client.post("/pets/", json=MEDIA_PET_PAYLOAD)
            pet_id = pet_resp.json()["id"]

            # Gerar conteúdo > 10MB (10MB + 1 byte)
            large_content = b"x" * (10 * 1024 * 1024 + 1)

            response = await client.post(
                f"/pets/{pet_id}/media",
                files={"file": ("big_photo.png", large_content, "image/png")},
                headers={"X-Shelter-Name": SHELTER_NAME},
            )

        assert response.status_code == 413
        assert "10 MB" in response.json()["detail"]


@pytest.mark.asyncio
class TestMediaVideoTooLarge:
    """Testes para vídeo > 100MB → 413."""

    async def test_post_media_video_exceeds_100mb_returns_413(self, setup_db):
        """POST /pets/{pet_id}/media com vídeo > 100MB retorna 413.
        Validates: Requirement 3.6
        """
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            pet_resp = await client.post("/pets/", json=MEDIA_PET_PAYLOAD)
            pet_id = pet_resp.json()["id"]

            # Gerar conteúdo > 100MB (100MB + 1 byte)
            large_content = b"x" * (100 * 1024 * 1024 + 1)

            response = await client.post(
                f"/pets/{pet_id}/media",
                files={"file": ("big_video.mp4", large_content, "video/mp4")},
                headers={"X-Shelter-Name": SHELTER_NAME},
            )

        assert response.status_code == 413
        assert "100 MB" in response.json()["detail"]


@pytest.mark.asyncio
class TestMediaDeleteNonexistent:
    """Testes para DELETE de mídia inexistente → 404."""

    async def test_delete_nonexistent_media_returns_404(self, setup_db):
        """DELETE /pets/{pet_id}/media/9999 com mídia inexistente retorna 404.
        Validates: Requirement 3.11
        """
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            pet_resp = await client.post("/pets/", json=MEDIA_PET_PAYLOAD)
            pet_id = pet_resp.json()["id"]

            response = await client.delete(
                f"/pets/{pet_id}/media/9999",
                headers={"X-Shelter-Name": SHELTER_NAME},
            )

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()


# ---------------------------------------------------------------------------
# Property-Based Tests
# ---------------------------------------------------------------------------
import asyncio
import io

from hypothesis import given, settings, HealthCheck
from hypothesis import strategies as st

# Allowed content-types per the whitelist
ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
}

# ---------------------------------------------------------------------------
# Strategy: generate content-type strings NOT in the allowed set.
#
# We build content-types that look realistic (type/subtype) but are not in
# the whitelist. We also allow completely arbitrary strings to cover edge cases.
# ---------------------------------------------------------------------------

# Common MIME type prefixes that generate realistic-looking but invalid types
_mime_types = st.sampled_from([
    "application", "audio", "font", "message", "model",
    "multipart", "text", "image", "video",
])

_mime_subtypes = st.text(
    alphabet=st.characters(
        whitelist_categories=("Ll", "Lu", "Nd"),
        whitelist_characters="-_.",
    ),
    min_size=1,
    max_size=30,
)

# Strategy 1: structured type/subtype MIME strings
_structured_content_type = st.builds(
    lambda t, s: f"{t}/{s}",
    _mime_types,
    _mime_subtypes,
)

# Strategy 2: completely arbitrary printable strings (no null bytes)
_arbitrary_content_type = st.text(
    alphabet=st.characters(
        blacklist_categories=("Cs",),
        blacklist_characters="\x00",
    ),
    min_size=1,
    max_size=60,
)

# Combined strategy: mix both approaches, filter out allowed types
invalid_content_type_st = st.one_of(
    _structured_content_type, _arbitrary_content_type
).filter(lambda ct: ct not in ALLOWED_CONTENT_TYPES)


# ---------------------------------------------------------------------------
# Property 5: Invalid media content-type rejected
# Validates: Requirements 3.4
# ---------------------------------------------------------------------------

# ASCII-safe pet payload for property tests (HTTP headers require ASCII encoding)
_PBT_PET_PAYLOAD = {
    "name": "Rex",
    "species": "dog",
    "breed": "Labrador",
    "age_group": "adult",
    "age_description": "3 anos",
    "size": "large",
    "sex": "male",
    "color": "amarelo",
    "shelter_name": "Abrigo Esperanca",
    "city": "Sao Paulo",
    "status": "Available",
}


@settings(
    max_examples=100,
    suppress_health_check=[HealthCheck.function_scoped_fixture],
    deadline=None,
)
@given(content_type=invalid_content_type_st)
def test_invalid_content_type_rejected_with_415(setup_db, content_type):
    """
    Property 5: Invalid media content-type rejected.

    For any file upload where the content-type is not one of the allowed types
    (image/jpeg, image/png, image/webp, video/mp4, video/webm), the API shall
    reject the request with HTTP 415.

    **Validates: Requirements 3.4**
    """

    async def run():
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            # Create a pet first
            pet_resp = await client.post("/pets/", json=_PBT_PET_PAYLOAD)
            assert pet_resp.status_code == 201
            pet_id = pet_resp.json()["id"]

            # Upload a file with the invalid content-type
            file_content = b"fake file content for testing"
            files = {
                "file": ("test_file.bin", io.BytesIO(file_content), content_type),
            }
            response = await client.post(
                f"/pets/{pet_id}/media",
                files=files,
                headers={"X-Shelter-Name": _PBT_PET_PAYLOAD["shelter_name"]},
            )

        assert response.status_code == 415, (
            f"Expected 415 for content-type '{content_type}', "
            f"got {response.status_code}: {response.text}"
        )
        body = response.json()
        assert "detail" in body
        assert "Unsupported media type" in body["detail"]

    asyncio.run(run())


# ---------------------------------------------------------------------------
# Property 6: Media list ordering invariant
# Validates: Requirements 3.8
# ---------------------------------------------------------------------------

import struct
import zlib
import tempfile

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.file_storage import FileStorageService


def _make_minimal_png() -> bytes:
    """Create a minimal valid 1x1 white PNG image."""

    def _png_chunk(chunk_type: bytes, data: bytes) -> bytes:
        chunk = chunk_type + data
        return (
            struct.pack(">I", len(data))
            + chunk
            + struct.pack(">I", zlib.crc32(chunk) & 0xFFFFFFFF)
        )

    signature = b"\x89PNG\r\n\x1a\n"
    # IHDR: 1x1, bit depth 8, color type 2 (RGB)
    ihdr_data = struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0)
    ihdr = _png_chunk(b"IHDR", ihdr_data)
    # IDAT: single row, filter byte 0, followed by RGB white pixel
    raw_data = b"\x00\xff\xff\xff"
    compressed = zlib.compress(raw_data)
    idat = _png_chunk(b"IDAT", compressed)
    # IEND
    iend = _png_chunk(b"IEND", b"")
    return signature + ihdr + idat + iend


MINIMAL_PNG = _make_minimal_png()

# Use ASCII-only shelter name to avoid httpx header encoding issues
_MEDIA_ORDERING_PET_PAYLOAD = {
    "name": "Rex",
    "species": "dog",
    "breed": "Labrador",
    "age_group": "adult",
    "age_description": "3 anos",
    "size": "large",
    "sex": "male",
    "color": "amarelo",
    "shelter_name": "Abrigo Esperanca",
    "city": "Sao Paulo",
    "status": "Available",
}

# Dedicated test database for the PBT ordering test (avoid conflicts with conftest)
_ordering_test_db_url = "sqlite:///./test_pet_media_ordering.db"
_ordering_engine = create_engine(
    _ordering_test_db_url, connect_args={"check_same_thread": False}
)
_OrderingSession = sessionmaker(autocommit=False, autoflush=False, bind=_ordering_engine)

# Temporary upload directory for ordering test
_ordering_upload_dir = tempfile.mkdtemp(prefix="test_media_ordering_")


def _ordering_override_get_db():
    db = _OrderingSession()
    try:
        yield db
    finally:
        db.close()


def _ordering_override_get_file_storage():
    return FileStorageService(upload_dir=_ordering_upload_dir)


# Strategy: generate number of media items between 2 and 20
num_media_st = st.integers(min_value=2, max_value=20)


@settings(
    max_examples=100,
    suppress_health_check=[HealthCheck.function_scoped_fixture],
    deadline=None,
)
@given(num_media=num_media_st)
def test_media_list_ordering_invariant(setup_db, num_media):
    """
    Property 6: Media list ordering invariant.

    Para qualquer pet com múltiplos itens de mídia, o endpoint GET /pets/{pet_id}/media
    deve retornar os itens ordenados por uploaded_at em ordem decrescente (mais recente
    primeiro), de forma que para todo par consecutivo de itens no resultado,
    uploaded_at[i] >= uploaded_at[i+1].

    **Validates: Requirements 3.8**
    """
    # Use dedicated DB and storage overrides for this PBT
    app.dependency_overrides[get_db] = _ordering_override_get_db
    app.dependency_overrides[get_file_storage] = _ordering_override_get_file_storage

    # Reset DB between hypothesis examples to avoid cross-example contamination
    Base.metadata.drop_all(bind=_ordering_engine)
    Base.metadata.create_all(bind=_ordering_engine)

    async def run():
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            # Create a pet first
            pet_resp = await client.post("/pets/", json=_MEDIA_ORDERING_PET_PAYLOAD)
            assert pet_resp.status_code == 201, (
                f"Failed to create pet: {pet_resp.status_code} {pet_resp.text}"
            )
            pet_id = pet_resp.json()["id"]

            # Upload `num_media` files sequentially
            for i in range(num_media):
                files = {
                    "file": (f"photo_{i}.png", io.BytesIO(MINIMAL_PNG), "image/png")
                }
                upload_resp = await client.post(
                    f"/pets/{pet_id}/media",
                    files=files,
                    headers={
                        "X-Shelter-Name": _MEDIA_ORDERING_PET_PAYLOAD["shelter_name"]
                    },
                )
                assert upload_resp.status_code == 201, (
                    f"Upload {i} failed: {upload_resp.status_code} {upload_resp.text}"
                )

            # Retrieve media list
            list_resp = await client.get(f"/pets/{pet_id}/media")
            assert list_resp.status_code == 200, (
                f"GET media list failed: {list_resp.status_code} {list_resp.text}"
            )
            media_list = list_resp.json()

            # Verify we got all items back
            assert len(media_list) == num_media, (
                f"Expected {num_media} media items, got {len(media_list)}"
            )

            # Verify ordering: for every consecutive pair,
            # uploaded_at[i] >= uploaded_at[i+1] (descending order)
            for i in range(len(media_list) - 1):
                current_ts = media_list[i]["uploaded_at"]
                next_ts = media_list[i + 1]["uploaded_at"]
                assert current_ts >= next_ts, (
                    f"Ordering violated at position {i}: "
                    f"uploaded_at[{i}]={current_ts!r} < uploaded_at[{i+1}]={next_ts!r}"
                )

    asyncio.get_event_loop().run_until_complete(run())
