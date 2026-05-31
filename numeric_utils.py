import math


def int_or_zero(value):
    """Convert aggregate values to a plain int without leaking database types."""
    try:
        if value is None or value == "":
            return 0
        return int(value)
    except (TypeError, ValueError, OverflowError):
        return 0


def float_or_zero(value):
    """Convert numeric values to a finite plain float suitable for JSON output."""
    try:
        if value is None or value == "":
            return 0.0
        numeric = float(value)
        return numeric if math.isfinite(numeric) else 0.0
    except (TypeError, ValueError, OverflowError):
        return 0.0
