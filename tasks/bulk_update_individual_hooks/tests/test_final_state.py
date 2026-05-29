import os
import subprocess
import sqlite3
import pytest

PROJECT_DIR = "/home/user/project"
DB_PATH = os.path.join(PROJECT_DIR, "database.sqlite")

def test_script_execution():
    """Run the update_users.js script and verify output."""
    script_path = os.path.join(PROJECT_DIR, "update_users.js")
    assert os.path.isfile(script_path), f"Script {script_path} does not exist."
    
    result = subprocess.run(
        ["node", "update_users.js"],
        cwd=PROJECT_DIR,
        capture_output=True,
        text=True
    )
    
    assert result.returncode == 0, f"Script failed with error: {result.stderr}"
    assert "Updated users successfully" in result.stdout, f"Expected success message not found in stdout. Got: {result.stdout}"

def test_database_updated():
    """Verify that the database was correctly updated."""
    # Ensure the script runs before checking the database
    # Since pytest runs tests sequentially by default, this will run after test_script_execution
    # But to be safe, we can just check the DB state assuming the script ran.
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if there are any pending users left
    cursor.execute("SELECT count(*) FROM Users WHERE status='pending';")
    pending_count = cursor.fetchone()[0]
    assert pending_count == 0, f"Expected 0 pending users, but found {pending_count}."
    
    # Check if active users have lastActivatedAt set
    cursor.execute("SELECT count(*) FROM Users WHERE status='active' AND lastActivatedAt IS NULL;")
    active_null_date_count = cursor.fetchone()[0]
    assert active_null_date_count == 0, f"Expected 0 active users with null lastActivatedAt, but found {active_null_date_count}. The hook did not fire correctly."
    
    # Check if there are active users with lastActivatedAt set (to ensure the update actually happened)
    cursor.execute("SELECT count(*) FROM Users WHERE status='active' AND lastActivatedAt IS NOT NULL;")
    active_with_date_count = cursor.fetchone()[0]
    assert active_with_date_count > 0, "Expected to find active users with lastActivatedAt set, but found 0."
    
    conn.close()
