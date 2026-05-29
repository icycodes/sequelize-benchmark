import os
import subprocess
import sqlite3
import pytest

PROJECT_DIR = "/home/user/myproject"
DB_PATH = os.path.join(PROJECT_DIR, "database.sqlite")

def test_run_transaction():
    """Run process.js and verify stdout."""
    users_json = '[{"username": "u1", "password": "pw1"}, {"username": "u2", "password": "pw2"}]'
    result = subprocess.run(
        ["node", "process.js", users_json],
        capture_output=True,
        text=True,
        cwd=PROJECT_DIR
    )
    assert result.returncode == 0, f"process.js failed with error: {result.stderr}"
    assert "Transaction complete." in result.stdout, f"Expected 'Transaction complete.' in stdout, got: {result.stdout}"

def test_verify_database_state():
    """Verify that the database state reflects the hooks."""
    assert os.path.exists(DB_PATH), f"Database file {DB_PATH} was not created."
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if Users table exists. Sequelize might name it 'Users' or 'users'.
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%user%';")
    tables = cursor.fetchall()
    assert len(tables) > 0, "No user table found in the database."
    table_name = tables[0][0]
    
    cursor.execute(f"SELECT username, password, status FROM {table_name} ORDER BY username ASC")
    users = cursor.fetchall()
    
    assert len(users) == 2, f"Expected 2 users, got {len(users)}"
    
    u1 = users[0]
    u2 = users[1]
    
    assert u1[0] == "u1", f"Expected first user to be 'u1', got {u1[0]}"
    assert u1[1] == "pw1-hashed", f"Expected u1 password to be 'pw1-hashed', got {u1[1]}"
    assert u1[2] == "active-updated", f"Expected u1 status to be 'active-updated', got {u1[2]}"
    
    assert u2[0] == "u2", f"Expected second user to be 'u2', got {u2[0]}"
    assert u2[1] == "pw2-hashed", f"Expected u2 password to be 'pw2-hashed', got {u2[1]}"
    assert u2[2] == "active-updated", f"Expected u2 status to be 'active-updated', got {u2[2]}"
    
    conn.close()
