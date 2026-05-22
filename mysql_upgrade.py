
import os
from sqlalchemy import create_engine, text
from app import _build_database_uri

def upgrade_mysql():
    data_dir = os.path.join(os.getcwd(), 'data')
    uri = _build_database_uri(os.path.join(data_dir, 'lottery_system.db'))
    if not uri.startswith('mysql'):
        return
    
    engine = create_engine(uri)
    alters = [
        ("user", "auto_prediction_regions", "TEXT DEFAULT 'hk,macau'"),
        ("user", "show_normal_numbers", "BOOLEAN DEFAULT False"),
        ("prediction_record", "prediction_metadata", "TEXT"),
        ("manual_bet_records", "bettor_name", "VARCHAR(50)")
    ]
    
    with engine.connect() as conn:
        for table, col, col_def in alters:
            try:
                # Check if column exists
                res = conn.execute(text(f"SHOW COLUMNS FROM {table} LIKE '{col}'"))
                if not res.fetchone():
                    print(f"Adding column {col} to {table}...")
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_def}"))
                    conn.commit()
            except Exception as e:
                print(f"Error checking/altering {table}.{col}: {e}")

if __name__ == '__main__':
    upgrade_mysql()
    print("MySQL upgrade checked.")
