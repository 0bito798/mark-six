import os
from urllib.parse import quote


MYSQL_CHARSET = "utf8mb4"


def _clean(value):
    if value is None:
        return None
    return str(value).strip()


def _env(env, name):
    return _clean(env.get(name))


def _first_env(env, names, default="", allow_empty=False):
    for name in names:
        if name not in env:
            continue
        value = _env(env, name)
        if value or allow_empty:
            return value or ""
    return default


def normalize_database_uri(uri):
    cleaned = _clean(uri) or ""
    lowered = cleaned.lower()
    if lowered.startswith("mysql://"):
        return f"mysql+pymysql://{cleaned[len('mysql://'):]}"
    if lowered.startswith("mariadb://"):
        return f"mariadb+pymysql://{cleaned[len('mariadb://'):]}"
    return cleaned


def using_mysql_env(env=None):
    current_env = os.environ if env is None else env
    db_type = (_env(current_env, "DB_TYPE") or "").lower()
    database_url = _env(current_env, "DATABASE_URL") or ""
    mysql_url = _env(current_env, "MYSQL_URL") or ""
    if db_type in ("mysql", "mariadb"):
        return True
    if database_url.lower().startswith(("mysql", "mariadb")):
        return True
    if mysql_url.lower().startswith(("mysql", "mariadb")):
        return True
    return bool(_env(current_env, "MYSQLHOST"))


def build_database_uri(db_path, env=None):
    current_env = os.environ if env is None else env

    database_url = _env(current_env, "DATABASE_URL")
    if database_url:
        return normalize_database_uri(database_url)

    mysql_url = _env(current_env, "MYSQL_URL")
    if mysql_url:
        return normalize_database_uri(mysql_url)

    if using_mysql_env(current_env):
        host = _first_env(current_env, ("DB_HOST", "MYSQLHOST"), default="localhost")
        port = _first_env(current_env, ("DB_PORT", "MYSQLPORT"), default="3306")
        name = _first_env(current_env, ("DB_NAME", "MYSQLDATABASE"), default="mark_six")
        user = _first_env(current_env, ("DB_USER", "MYSQLUSER"), default="root")
        password = _first_env(
            current_env,
            ("DB_PASSWORD", "MYSQLPASSWORD"),
            default="",
            allow_empty=True,
        )
        encoded_user = quote(user, safe="")
        encoded_password = quote(password, safe="")
        return (
            f"mysql+pymysql://{encoded_user}:{encoded_password}"
            f"@{host}:{port}/{name}?charset={MYSQL_CHARSET}"
        )

    return f"sqlite:///{db_path}"
