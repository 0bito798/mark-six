import os
from urllib.parse import quote_plus


MYSQL_CHARSET = "utf8mb4"


def _env(name, default=""):
    value = os.environ.get(name)
    if value is None:
        return default
    return str(value).strip()


def normalize_mysql_uri(uri):
    value = str(uri or "").strip()
    lower_value = value.lower()
    if lower_value.startswith("mysql://"):
        return f"mysql+pymysql://{value[len('mysql://'):]}"
    if lower_value.startswith("mariadb://"):
        return f"mysql+pymysql://{value[len('mariadb://'):]}"
    return value


def is_mysql_configured():
    db_type = _env("DB_TYPE", "sqlite").lower()
    database_url = _env("DATABASE_URL")
    mysql_url = _env("MYSQL_URL")

    if db_type in ("mysql", "mariadb"):
        return True
    if database_url.lower().startswith(("mysql", "mariadb")):
        return True
    if mysql_url.lower().startswith(("mysql", "mariadb")):
        return True
    return bool(_env("MYSQLHOST"))


def build_database_uri(sqlite_db_path, mysql_charset=MYSQL_CHARSET):
    database_url = _env("DATABASE_URL") or _env("MYSQL_URL")
    if database_url:
        return normalize_mysql_uri(database_url)

    if is_mysql_configured():
        host = _env("DB_HOST") or _env("MYSQLHOST") or "localhost"
        port = _env("DB_PORT") or _env("MYSQLPORT") or "3306"
        name = _env("DB_NAME") or _env("MYSQLDATABASE") or "mark_six"
        user = quote_plus(_env("DB_USER") or _env("MYSQLUSER") or "root")
        password = quote_plus(_env("DB_PASSWORD") or _env("MYSQLPASSWORD") or "")
        return f"mysql+pymysql://{user}:{password}@{host}:{port}/{name}?charset={mysql_charset}"

    return f"sqlite:///{sqlite_db_path}"
