import os
import subprocess
import pytest

PROJECT_DIR = "/home/user/project"
DB_FILE = os.path.join(PROJECT_DIR, "database.sqlite")

@pytest.fixture(scope="session", autouse=True)
def setup_environment():
    # Install dependencies
    subprocess.run(["npm", "install"], cwd=PROJECT_DIR, check=True)
    # Remove existing database if any, to ensure a fresh run
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)

def test_script_execution():
    """Run the script and verify output."""
    result = subprocess.run(
        ["node", "index.js"],
        cwd=PROJECT_DIR,
        capture_output=True,
        text=True
    )
    assert result.returncode == 0, f"Script failed with error: {result.stderr}"
    assert "Success: User and Account created and linked." in result.stdout, \
        f"Expected success message in stdout, got: {result.stdout}"

def test_database_state_users():
    """Verify Users table references Account."""
    result = subprocess.run(
        ["sqlite3", "database.sqlite", "SELECT primaryAccountId FROM Users LIMIT 1;"],
        cwd=PROJECT_DIR,
        capture_output=True,
        text=True
    )
    assert result.returncode == 0, f"sqlite3 query failed: {result.stderr}"
    output = result.stdout.strip()
    assert output == "1", f"Expected primaryAccountId to be 1, got: {output}"

def test_database_state_accounts():
    """Verify Accounts table references User."""
    result = subprocess.run(
        ["sqlite3", "database.sqlite", "SELECT primaryUserId FROM Accounts LIMIT 1;"],
        cwd=PROJECT_DIR,
        capture_output=True,
        text=True
    )
    assert result.returncode == 0, f"sqlite3 query failed: {result.stderr}"
    output = result.stdout.strip()
    assert output == "1", f"Expected primaryUserId to be 1, got: {output}"
