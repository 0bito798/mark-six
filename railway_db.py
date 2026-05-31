import os
from urllib.parse import quote, quote_plus


MYSQL_CHARSET = "utf8mb4"
MYSQL_DRIVER_SCHEME = "mysql+pymysql://"


def _env_value(environ, name, default=""):
    source = os.environ if environ is None else environ
    value = source.get(name, default)
    if value is None:
        return ""
    return str(value).strip()


def _first_env_value(environ, names, default=""):
    for name in names:
        value = _env_value(environ, name)
        if value:
            return value
    return default


def _is_mysql_url(value):
    normalized = str(value or "").strip().lower()
    return normalized.startswith(("mysql://", "mysql+", "mariadb://", "mariadb+"))


def _validated_netloc_part(value, env_names):
    if not value or any(char.isspace() or char in "/?#@" for char in value):
        raise ValueError(f"{env_names} must not contain whitespace or URL separators")
    return value


def normalize_mysql_url(database_url):
    url = str(database_url or "").strip()
    lower_url = url.lower()
    scheme_end = lower_url.find("://")
    if scheme_end != -1:
        scheme = lower_url[:scheme_end]
        if scheme == "mysql" or scheme.startswith("mysql+"):
            return MYSQL_DRIVER_SCHEME + url[scheme_end + 3 :]
        if scheme == "mariadb" or scheme.startswith("mariadb+"):
            return MYSQL_DRIVER_SCHEME + url[scheme_end + 3 :]
    return url


def is_mysql_configured(environ=None):
    db_type = _env_value(environ, "DB_TYPE").lower()
    return (
        db_type in ("mysql", "mariadb")
        or _is_mysql_url(_env_value(environ, "DATABASE_URL"))
        or _is_mysql_url(_env_value(environ, "MYSQL_URL"))
        or bool(_env_value(environ, "MYSQLHOST"))
    )


def build_database_uri(db_path, environ=None):
    database_url = _env_value(environ, "DATABASE_URL")
    if database_url:
        return normalize_mysql_url(database_url)

    mysql_url = _env_value(environ, "MYSQL_URL")
    if mysql_url:
        return normalize_mysql_url(mysql_url)

    if is_mysql_configured(environ):
        host = _first_env_value(environ, ("DB_HOST", "MYSQLHOST"), "localhost")
        port = _first_env_value(environ, ("DB_PORT", "MYSQLPORT"), "3306")
        name = _first_env_value(environ, ("DB_NAME", "MYSQLDATABASE"), "mark_six")
        user = _first_env_value(environ, ("DB_USER", "MYSQLUSER"), "root")
        password = _first_env_value(environ, ("DB_PASSWORD", "MYSQLPASSWORD"), "")
        host = _validated_netloc_part(host, "DB_HOST or MYSQLHOST")
        port = _validated_netloc_part(port, "DB_PORT or MYSQLPORT")
        return (
            f"{MYSQL_DRIVER_SCHEME}{quote_plus(user)}:{quote_plus(password)}@"
            f"{host}:{port}/{quote(name, safe='')}?charset={MYSQL_CHARSET}"
        )

    return f"sqlite:///{db_path}"
