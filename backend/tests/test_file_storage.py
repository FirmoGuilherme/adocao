"""
Testes unitários para FileStorageService.
Requirements: 3.1, 3.7
"""
import os
import tempfile
from io import BytesIO
from unittest.mock import MagicMock

import pytest

from app.file_storage import FileStorageService


@pytest.fixture
def tmp_upload_dir(tmp_path):
    """Cria um diretório temporário para uploads."""
    return str(tmp_path / "uploads")


@pytest.fixture
def service(tmp_upload_dir):
    """Cria uma instância do FileStorageService com diretório temporário."""
    return FileStorageService(upload_dir=tmp_upload_dir)


def make_upload_file(filename: str, content: bytes = b"fake content"):
    """Cria um mock de UploadFile para testes."""
    mock_file = MagicMock()
    mock_file.filename = filename
    mock_file.file = BytesIO(content)
    return mock_file


class TestSaveFile:
    def test_saves_file_and_returns_relative_path(self, service, tmp_upload_dir):
        file = make_upload_file("photo.jpg", b"image data")
        result = service.save_file(pet_id=1, file=file)

        assert result.startswith("pets/1/")
        assert result.endswith(".jpg")

        full_path = os.path.join(tmp_upload_dir, result)
        assert os.path.exists(full_path)
        with open(full_path, "rb") as f:
            assert f.read() == b"image data"

    def test_creates_directories_automatically(self, service, tmp_upload_dir):
        file = make_upload_file("video.mp4", b"video data")
        result = service.save_file(pet_id=42, file=file)

        pet_dir = os.path.join(tmp_upload_dir, "pets", "42")
        assert os.path.isdir(pet_dir)

    def test_generates_unique_filenames(self, service):
        file1 = make_upload_file("photo.jpg", b"data1")
        file2 = make_upload_file("photo.jpg", b"data2")

        result1 = service.save_file(pet_id=1, file=file1)
        result2 = service.save_file(pet_id=1, file=file2)

        assert result1 != result2

    def test_handles_file_without_extension(self, service, tmp_upload_dir):
        file = make_upload_file("noextension", b"data")
        result = service.save_file(pet_id=1, file=file)

        assert result.startswith("pets/1/")
        assert "." not in os.path.basename(result)

        full_path = os.path.join(tmp_upload_dir, result)
        assert os.path.exists(full_path)

    def test_handles_none_filename(self, service, tmp_upload_dir):
        file = make_upload_file("", b"data")
        file.filename = None
        result = service.save_file(pet_id=1, file=file)

        assert result.startswith("pets/1/")
        full_path = os.path.join(tmp_upload_dir, result)
        assert os.path.exists(full_path)


class TestDeleteFile:
    def test_deletes_existing_file(self, service, tmp_upload_dir):
        file = make_upload_file("photo.png", b"image data")
        relative_path = service.save_file(pet_id=1, file=file)

        full_path = os.path.join(tmp_upload_dir, relative_path)
        assert os.path.exists(full_path)

        service.delete_file(relative_path)
        assert not os.path.exists(full_path)

    def test_handles_nonexistent_file_gracefully(self, service):
        # Should not raise any exception
        service.delete_file("pets/999/nonexistent.jpg")


class TestGetUrl:
    def test_returns_static_url(self, service):
        url = service.get_url("pets/1/abc123.jpg")
        assert url == "/static/uploads/pets/1/abc123.jpg"

    def test_returns_correct_format_for_any_path(self, service):
        url = service.get_url("pets/42/someuuid.mp4")
        assert url == "/static/uploads/pets/42/someuuid.mp4"
