import os
import sqlite3
import shutil

PROJECT_DIR = "/home/user/project"
DB_PATH = os.path.join(PROJECT_DIR, "database.sqlite")

def test_node_available():
    assert shutil.which("node") is not None, "node binary not found in PATH."

def test_project_dir_exists():
    assert os.path.isdir(PROJECT_DIR), f"Project directory {PROJECT_DIR} does not exist."

def test_database_exists():
    assert os.path.isfile(DB_PATH), f"Database file {DB_PATH} does not exist."

def test_database_seeded():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if Users table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='Users';")
    table = cursor.fetchone()
    assert table is not None, "Users table does not exist in the database."
    
    # Check if there are pending users
    cursor.execute("SELECT count(*) FROM Users WHERE status='pending';")
    count = cursor.fetchone()[0]
    assert count > 0, "No users with status 'pending' found in the database."
    
    conn.close()
