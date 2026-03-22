# backend/reset_db.py
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, Base
import models

print("Dropping all tables from PostgreSQL...")
Base.metadata.drop_all(bind=engine)
print("Creating all tables in PostgreSQL with updated schema...")
Base.metadata.create_all(bind=engine)
print("Database schema has been updated successfully!")
