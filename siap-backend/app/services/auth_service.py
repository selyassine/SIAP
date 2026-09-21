"""Authentication service – orchestrates user verification and token issuance.

Sits between the API layer and the CRUD / security utilities so that
endpoint handlers stay thin.
"""

from typing import Optional

from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.crud.user import user_crud
from app.models.user import User


def authenticate_user(db: Session, *, email: str, password: str) -> Optional[User]:
    """Validate credentials and return the user if they match.

    Args:
        db: Active database session.
        email: Submitted email address.
        password: Plain-text password to verify.

    Returns:
        The ``User`` object on success, ``None`` otherwise.
    """
    user = user_crud.get_by_email(db, email=email)
    if user is None:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    if not user.is_active:
        return None
    return user


def create_tokens(user: User) -> dict[str, str]:
    """Generate an access + refresh token pair for the given user.

    Args:
        user: Authenticated user instance.

    Returns:
        Dict with ``access_token``, ``refresh_token``, and ``token_type``.
    """
    payload = {"sub": user.email}
    return {
        "access_token": create_access_token(payload),
        "refresh_token": create_refresh_token(payload),
        "token_type": "bearer",
    }


def register_user(
    db: Session,
    *,
    email: str,
    password: str,
    full_name: str,
    company: Optional[str] = None,
) -> User:
    """Create a new user account with a hashed password.

    Args:
        db: Active database session.
        email: New user's email (must be unique).
        password: Plain-text password (will be hashed).
        full_name: Full name of the user.
        company: Optional company name.

    Returns:
        The newly created ``User`` object.

    Raises:
        ValueError: If the email is already registered.
    """
    existing = user_crud.get_by_email(db, email=email)
    if existing is not None:
        raise ValueError("A user with this email already exists")

    hashed = hash_password(password)
    return user_crud.create_user(
        db,
        email=email,
        hashed_password=hashed,
        full_name=full_name,
        company=company,
    )


def refresh_access_token(refresh_token: str) -> Optional[dict[str, str]]:
    """Issue a new access token from a valid refresh token.

    Args:
        refresh_token: The refresh JWT to validate.

    Returns:
        A new token dict on success, ``None`` if the refresh token is invalid.
    """
    payload = decode_token(refresh_token)
    if payload is None:
        return None
    if payload.get("type") != "refresh":
        return None

    email = payload.get("sub")
    if email is None:
        return None

    new_access = create_access_token({"sub": email})
    return {
        "access_token": new_access,
        "refresh_token": refresh_token,  # keep the same refresh token
        "token_type": "bearer",
    }
