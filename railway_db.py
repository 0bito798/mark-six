import os
from decimal import Decimal
from urllib.parse import quote_plus


def _env_value(*names, default=""):
    for name in names:
        value = os.environ.get(name)
        if value is None:
            continue
        cleaned = str(value).strip()
        if cleaned:
            return cleaned
    return default


def normalize_database_url(url):
    cleaned = str(url or "").strip()
    if cleaned.lower().startswith("mysql://"):
        return "mysql+pymysql://" + cleaned[len("mysql://"):]
    return cleaned


def is_mysql_configured():
    db_url = _env_value("DATABASE_URL", "MYSQL_URL")
    if normalize_database_url(db_url).lower().startswith("mysql"):
        return True

    db_type = _env_value("DB_TYPE").lower()
    if db_type in ("mysql", "mariadb"):
        return True

    return bool(_env_value("MYSQLHOST"))


def build_database_uri(db_path):
    db_url = _env_value("DATABASE_URL", "MYSQL_URL")
    if db_url:
        return normalize_database_url(db_url)

    db_type = _env_value("DB_TYPE", default="sqlite").lower()
    if db_type in ("mysql", "mariadb") or _env_value("MYSQLHOST"):
        host = _env_value("DB_HOST", "MYSQLHOST", default="localhost")
        port = _env_value("DB_PORT", "MYSQLPORT", default="3306")
        name = _env_value("DB_NAME", "MYSQLDATABASE", default="mark_six")
        user = quote_plus(_env_value("DB_USER", "MYSQLUSER", default="root"))
        password = quote_plus(_env_value("DB_PASSWORD", "MYSQLPASSWORD"))
        return f"mysql+pymysql://{user}:{password}@{host}:{port}/{name}?charset=utf8mb4"

    return f"sqlite:///{db_path}"


def int_or_zero(value):
    if value in (None, ""):
        return 0
    if isinstance(value, Decimal):
        return int(value)
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


def float_or_zero(value):
    if value in (None, ""):
        return 0.0
    if isinstance(value, Decimal):
        return float(value)
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0
