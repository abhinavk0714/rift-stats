# business/base_service.py
# Optional base for shared behavior; services may subclass or stand alone.

class NotFoundError(ValueError):
    """Raised when a requested entity does not exist."""
    pass
