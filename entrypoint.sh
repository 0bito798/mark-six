#!/bin/sh
export FLASK_APP=app

# 确保数据目录存在并有正确的权限
mkdir -p /app/data
chmod 777 /app/data
chown -R nobody:nogroup /app/data 2>/dev/null || echo "无法更改所有者，继续执行..."

echo "Initializing Database (MySQL or SQLite)..."
python3 -c 'from app import init_database; init_database()'

echo "正在启动 Gunicorn 服务器..."
exec "$@"
