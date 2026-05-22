import sys

patch = """
        # MySQL Auto-Update Check
        if db.engine.name in ('mysql', 'mariadb'):
            try:
                from sqlalchemy import text
                with db.engine.connect() as conn:
                    res = conn.execute(text("SHOW COLUMNS FROM user LIKE 'auto_prediction_regions'"))
                    if not res.fetchone():
                        conn.execute(text("ALTER TABLE user ADD COLUMN auto_prediction_regions TEXT DEFAULT 'hk,macau'"))
                    
                    res = conn.execute(text("SHOW COLUMNS FROM user LIKE 'show_normal_numbers'"))
                    if not res.fetchone():
                        conn.execute(text("ALTER TABLE user ADD COLUMN show_normal_numbers BOOLEAN DEFAULT False"))
                    
                    res = conn.execute(text("SHOW COLUMNS FROM prediction_record LIKE 'prediction_metadata'"))
                    if not res.fetchone():
                        conn.execute(text("ALTER TABLE prediction_record ADD COLUMN prediction_metadata TEXT"))
                    
                    res = conn.execute(text("SHOW COLUMNS FROM manual_bet_records LIKE 'bettor_name'"))
                    if not res.fetchone():
                        conn.execute(text("ALTER TABLE manual_bet_records ADD COLUMN bettor_name VARCHAR(50)"))
                    
                    conn.commit()
            except Exception as e:
                print(f"MySQL schema auto update failed: {e}")
"""

with open('app.py', 'r', encoding='utf-8') as f:
    content = f.read()

target = "def init_database():\n    with app.app_context():\n        db.create_all()\n"
insertion = target + patch + "\n"

if "MySQL Auto-Update Check" not in content:
    content = content.replace(target, insertion)
    with open('app.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched app.py")
else:
    print("Already patched")
