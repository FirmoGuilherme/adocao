import os
import uuid
import shutil
from pathlib import Path

from fastapi import UploadFile


class FileStorageService:
    """Serviço de armazenamento de arquivos para mídias de pets."""

    def __init__(self, upload_dir: str | None = None):
        self.upload_dir = upload_dir or os.environ.get("UPLOAD_DIR", "./uploads")

    def save_file(self, pet_id: int, file: UploadFile) -> str:
        """Salva arquivo e retorna o path relativo.

        O arquivo é salvo em {UPLOAD_DIR}/pets/{pet_id}/{uuid}.{ext}
        e o path relativo retornado é pets/{pet_id}/{uuid}.{ext}.
        """
        original_filename = file.filename or ""
        ext = Path(original_filename).suffix.lstrip(".")
        unique_name = f"{uuid.uuid4()}.{ext}" if ext else str(uuid.uuid4())

        relative_path = os.path.join("pets", str(pet_id), unique_name)
        full_path = os.path.join(self.upload_dir, relative_path)

        os.makedirs(os.path.dirname(full_path), exist_ok=True)

        with open(full_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return relative_path

    def delete_file(self, file_path: str) -> None:
        """Remove arquivo do filesystem.

        Trata graciosamente caso o arquivo não exista.
        """
        full_path = os.path.join(self.upload_dir, file_path)
        try:
            os.remove(full_path)
        except FileNotFoundError:
            pass

    def get_url(self, file_path: str) -> str:
        """Retorna URL pública do arquivo."""
        return f"/static/uploads/{file_path}"
