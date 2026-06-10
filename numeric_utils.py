from decimal import Decimal


def int_or_zero(value):
    if value is None or value == "":
        return 0
    try:
        return int(value)
    except (TypeError, ValueError, ArithmeticError):
        return 0


def float_or_zero(value):
    if value is None or value == "":
        return 0.0
    try:
        if isinstance(value, Decimal):
            return float(value)
        return float(value)
    except (TypeError, ValueError, ArithmeticError):
        return 0.0
