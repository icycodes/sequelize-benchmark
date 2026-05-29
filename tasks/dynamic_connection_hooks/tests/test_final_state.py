import os
import subprocess
import sqlite3
import pytest

PROJECT_DIR = "/home/user/myproject"
DB_PATH = os.path.join(PROJECT_DIR, "database.sqlite")
TOKEN_PATH = os.path.join(PROJECT_DIR, "token.txt")
EXPECTED_TOKEN = "secret_token_123"

@pytest.fixture(scope="session", autouse=True)
def setup_environment():
    # Run npm install
    subprocess.run(["npm", "install"], cwd=PROJECT_DIR, check=True)
    
    # Remove existing database if any
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        
    # Create token.txt
    with open(TOKEN_PATH, "w") as f:
        f.write(EXPECTED_TOKEN)
        
    # Run the script
    result = subprocess.run(
        ["node", "index.js"],
        cwd=PROJECT_DIR,
        capture_output=True,
        text=True
    )
    
    yield result

def test_script_execution_output(setup_environment):
    """Verify that the script runs successfully and prints the correct password."""
    result = setup_environment
    assert result.returncode == 0, f"Script execution failed: {result.stderr}"
    expected_output = f"Connected with password: {EXPECTED_TOKEN}"
    assert expected_output in result.stdout, \
        f"Expected to find '{expected_output}' in stdout, got: {result.stdout}"

def test_database_file_exists():
    """Verify that the SQLite database file was created."""
    assert os.path.isfile(DB_PATH), f"Database file {DB_PATH} was not created."

def test_user_inserted_in_database():
    """Verify that the user 'alice' was inserted into the database."""
    # We use Python's built-in sqlite3 to verify the data
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Find all table names to handle case sensitivity (e.g. Users vs users)
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0].lower() for row in cursor.fetchall()]
    
    assert "users" in tables, "Table 'Users' or 'users' not found in the database."
    
    # Query for alice, ignoring case on table name by finding the exact table name
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' COLLATE NOCASE AND name='users';")
    table_name = cursor.fetchone()[0]
    
    cursor.execute(f"SELECT username FROM {table_name} WHERE username='alice';")
    row = cursor.fetchone()
    
    assert row is not None, "User 'alice' was not found in the database."
    assert row[0] == 'alice', f"Expected username 'alice', got {row[0]}"
    
    conn.close()
