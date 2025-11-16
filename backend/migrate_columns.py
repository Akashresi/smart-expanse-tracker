import sqlite3
DB_PATH = "test.db"
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(saving_goals)")
cols = [col[1] for col in cursor.fetchall()]
print("Existing columns:", cols)
if "targetAmount" in cols:
    print("Renaming targetAmount -> target_amount")
    cursor.execute("ALTER TABLE saving_goals RENAME COLUMN targetAmount TO target_amount;")
if "savedAmount" in cols:
    print("Renaming savedAmount -> saved_amount")
    cursor.execute("ALTER TABLE saving_goals RENAME COLUMN savedAmount TO saved_amount;")
conn.commit()
conn.close()
print("Migration complete.")

