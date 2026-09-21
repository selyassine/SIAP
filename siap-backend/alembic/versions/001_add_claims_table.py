"""add_claims_table

Revision ID: 001_add_claims
Revises:
Create Date: 2026-06-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '001_add_claims'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'claims',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('claim_number', sa.String(length=20), nullable=True),
        sa.Column('months_as_customer', sa.Integer(), nullable=True),
        sa.Column('age', sa.Integer(), nullable=True),
        sa.Column('policy_state', sa.String(length=10), nullable=True),
        sa.Column('policy_csl', sa.String(length=20), nullable=True),
        sa.Column('policy_deductable', sa.Integer(), nullable=True),
        sa.Column('policy_annual_premium', sa.Float(), nullable=True),
        sa.Column('umbrella_limit', sa.Integer(), nullable=True),
        sa.Column('insured_sex', sa.String(length=10), nullable=True),
        sa.Column('insured_education_level', sa.String(length=50), nullable=True),
        sa.Column('insured_occupation', sa.String(length=50), nullable=True),
        sa.Column('insured_hobbies', sa.String(length=50), nullable=True),
        sa.Column('insured_relationship', sa.String(length=30), nullable=True),
        sa.Column('capital_gains', sa.Float(), nullable=True),
        sa.Column('capital_loss', sa.Float(), nullable=True),
        sa.Column('incident_type', sa.String(length=50), nullable=True),
        sa.Column('collision_type', sa.String(length=50), nullable=True),
        sa.Column('incident_severity', sa.String(length=30), nullable=True),
        sa.Column('authorities_contacted', sa.String(length=30), nullable=True),
        sa.Column('incident_state', sa.String(length=10), nullable=True),
        sa.Column('incident_city', sa.String(length=50), nullable=True),
        sa.Column('incident_location', sa.String(length=100), nullable=True),
        sa.Column('incident_hour_of_the_day', sa.Integer(), nullable=True),
        sa.Column('number_of_vehicles_involved', sa.Integer(), nullable=True),
        sa.Column('property_damage', sa.String(length=10), nullable=True),
        sa.Column('bodily_injuries', sa.Integer(), nullable=True),
        sa.Column('witnesses', sa.Integer(), nullable=True),
        sa.Column('police_report_available', sa.String(length=10), nullable=True),
        sa.Column('total_claim_amount', sa.Float(), nullable=True),
        sa.Column('injury_claim', sa.Float(), nullable=True),
        sa.Column('property_claim', sa.Float(), nullable=True),
        sa.Column('vehicle_claim', sa.Float(), nullable=True),
        sa.Column('auto_make', sa.String(length=50), nullable=True),
        sa.Column('auto_model', sa.String(length=50), nullable=True),
        sa.Column('auto_year', sa.Integer(), nullable=True),
        sa.Column('fraud_score', sa.Float(), nullable=True),
        sa.Column('fraud_risk_level', sa.String(length=20), nullable=True),
        sa.Column('fraud_alert', sa.Boolean(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_claims_claim_number'), 'claims', ['claim_number'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_claims_claim_number'), table_name='claims')
    op.drop_table('claims')
