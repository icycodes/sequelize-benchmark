import os
import subprocess
import pytest

PROJECT_DIR = "/home/user/myproject"
LOG_FILE = os.path.join(PROJECT_DIR, "hooks.log")
DB_FILE = os.path.join(PROJECT_DIR, "database.sqlite")

@pytest.fixture(scope="session", autouse=True)
def setup_environment():
    """Run npm install and clean up previous artifacts before tests."""
    subprocess.run(["npm", "install"], cwd=PROJECT_DIR, check=True)
    if os.path.exists(LOG_FILE):
        os.remove(LOG_FILE)
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)

def test_run_script_stdout():
    """Run the script and verify stdout."""
    result = subprocess.run(
        ["node", "run.js"],
        cwd=PROJECT_DIR,
        capture_output=True,
        text=True
    )
    assert result.returncode == 0, f"Script failed with error: {result.stderr}"
    assert "Operations completed" in result.stdout, f"Expected 'Operations completed' in stdout, got: {result.stdout}"

def test_hooks_log_file():
    """Check that the log file contains the expected hook triggers."""
    assert os.path.exists(LOG_FILE), f"Log file {LOG_FILE} was not created."
    
    with open(LOG_FILE, "r") as f:
        content = f.read()
    
    assert "Triggered beforeBulkCreate" in content, "The beforeBulkCreate hook was not triggered or logged."
    assert "Triggered beforeBulkDestroy" in content, "The beforeBulkDestroy hook was not triggered or logged."

def test_database_state():
    """Verify that the database state reflects the add and remove operations."""
    assert os.path.exists(DB_FILE), f"Database file {DB_FILE} was not created."
    
    result = subprocess.run(
        ["sqlite3", DB_FILE, "SELECT count(*) FROM UserRoles;"],
        capture_output=True,
        text=True
    )
    assert result.returncode == 0, f"sqlite3 query failed: {result.stderr}"
    
    count = result.stdout.strip()
    assert count == "1", f"Expected exactly 1 record in UserRoles, got {count}."