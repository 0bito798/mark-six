#!/bin/sh
export FLASK_APP=app

mkdir -p /app/data
chmod 777 /app/data
chown -R nobody:nogroup /app/data 2>/dev/null || echo "Unable to change data owner, continuing..."

echo "Current directory: $(pwd)"
echo "Data directory contents:"
ls -la /app/data

trim_env() {
    printf '%s' "$1" | sed 's/^[[:space:]]*//; s/[[:space:]]*$//'
}

DB_TYPE_LOWER=$(trim_env "${DB_TYPE:-}" | tr '[:upper:]' '[:lower:]')
DATABASE_URL_TRIMMED=$(trim_env "${DATABASE_URL:-}")
MYSQL_URL_TRIMMED=$(trim_env "${MYSQL_URL:-}")
MYSQLHOST_TRIMMED=$(trim_env "${MYSQLHOST:-}")
DATABASE_URL_LOWER=$(printf '%s' "$DATABASE_URL_TRIMMED" | tr '[:upper:]' '[:lower:]')
MYSQL_URL_LOWER=$(printf '%s' "$MYSQL_URL_TRIMMED" | tr '[:upper:]' '[:lower:]')
MYSQL_CONFIGURED=0

case "$DATABASE_URL_LOWER" in
    mysql://*|mysql+*|mariadb://*|mariadb+*) MYSQL_CONFIGURED=1 ;;
esac

case "$MYSQL_URL_LOWER" in
    mysql://*|mysql+*|mariadb://*|mariadb+*) MYSQL_CONFIGURED=1 ;;
esac

if [ "$DB_TYPE_LOWER" = "mysql" ] || [ "$DB_TYPE_LOWER" = "mariadb" ] || [ -n "$MYSQLHOST_TRIMMED" ]; then
    MYSQL_CONFIGURED=1
fi

if [ "$MYSQL_CONFIGURED" = "1" ]; then
    echo "MySQL configured, skipping sqlite initialization."
else
    if [ ! -f /app/data/lottery_system.db ]; then
        echo "SQLite database file not found, initializing..."
        python create_db.py

        if [ -f /app/data/lottery_system.db ]; then
            echo "SQLite database created: $(ls -la /app/data/lottery_system.db)"
            chmod 666 /app/data/lottery_system.db
        else
            echo "Warning: SQLite database file was not created."
        fi
    else
        echo "SQLite database file exists: $(ls -la /app/data/lottery_system.db)"
        chmod 666 /app/data/lottery_system.db
    fi
fi

echo "Running database initialization..."
python3 -c "from app import init_database; init_database()"

echo "Starting service..."
exec "$@"
