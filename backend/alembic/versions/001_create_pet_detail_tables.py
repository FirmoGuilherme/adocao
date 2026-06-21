"""create pet_health_records, pet_temperaments and pet_media tables

Revision ID: 001
Revises: None
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- pet_health_records ---
    op.create_table(
        "pet_health_records",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("pet_id", sa.Integer(), sa.ForeignKey("pets.id"), nullable=False),
        sa.Column("vaccination_records", sa.JSON(), nullable=True),
        sa.Column("medical_conditions", sa.JSON(), nullable=True),
        sa.Column("surgeries", sa.JSON(), nullable=True),
        sa.Column("special_needs", sa.Text(), nullable=True),
        sa.Column("last_vet_visit", sa.DateTime(), nullable=True),
        sa.Column("weight_kg", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_pet_health_records_id", "pet_health_records", ["id"])
    op.create_index("ix_pet_health_records_pet_id", "pet_health_records", ["pet_id"], unique=True)

    # --- pet_temperaments ---
    op.create_table(
        "pet_temperaments",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("pet_id", sa.Integer(), sa.ForeignKey("pets.id"), nullable=False),
        sa.Column("energy_level", sa.Integer(), nullable=False),
        sa.Column("sociability_people", sa.Integer(), nullable=False),
        sa.Column("sociability_animals", sa.Integer(), nullable=False),
        sa.Column("training_level", sa.Integer(), nullable=False),
        sa.Column("independence_level", sa.Integer(), nullable=False),
        sa.Column("playfulness", sa.Integer(), nullable=False),
        sa.Column("noise_level", sa.Integer(), nullable=False),
        sa.Column("behavior_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_pet_temperaments_id", "pet_temperaments", ["id"])
    op.create_index("ix_pet_temperaments_pet_id", "pet_temperaments", ["pet_id"], unique=True)

    # --- pet_media ---
    op.create_table(
        "pet_media",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("pet_id", sa.Integer(), sa.ForeignKey("pets.id"), nullable=False),
        sa.Column("media_type", sa.String(), nullable=False),
        sa.Column("file_name", sa.String(), nullable=False),
        sa.Column("file_path", sa.String(), nullable=False),
        sa.Column("url", sa.String(), nullable=False),
        sa.Column("file_size_bytes", sa.Integer(), nullable=False),
        sa.Column("uploaded_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_pet_media_id", "pet_media", ["id"])
    op.create_index("ix_pet_media_pet_id", "pet_media", ["pet_id"])


def downgrade() -> None:
    op.drop_index("ix_pet_media_pet_id", table_name="pet_media")
    op.drop_index("ix_pet_media_id", table_name="pet_media")
    op.drop_table("pet_media")

    op.drop_index("ix_pet_temperaments_pet_id", table_name="pet_temperaments")
    op.drop_index("ix_pet_temperaments_id", table_name="pet_temperaments")
    op.drop_table("pet_temperaments")

    op.drop_index("ix_pet_health_records_pet_id", table_name="pet_health_records")
    op.drop_index("ix_pet_health_records_id", table_name="pet_health_records")
    op.drop_table("pet_health_records")
