import os
import subprocess
import json
import pytest

PROJECT_DIR = "/home/user/myproject"
DB_FILE = os.path.join(PROJECT_DIR, "database.sqlite")
OUTPUT_FILE = os.path.join(PROJECT_DIR, "output.json")

@pytest.fixture(scope="session", autouse=True)
def run_script():
    """Run the Node.js script to generate artifacts."""
    result = subprocess.run(
        ["node", "index.js"],
        cwd=PROJECT_DIR,
        capture_output=True,
        text=True
    )
    assert result.returncode == 0, f"Script execution failed:\nSTDOUT: {result.stdout}\nSTDERR: {result.stderr}"

def test_database_sqlite_exists():
    assert os.path.isfile(DB_FILE), f"Database file {DB_FILE} was not created."

def test_output_json_exists():
    assert os.path.isfile(OUTPUT_FILE), f"Output file {OUTPUT_FILE} was not created."

def test_output_json_contents():
    with open(OUTPUT_FILE, "r") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            pytest.fail(f"Failed to parse {OUTPUT_FILE} as JSON: {e}")
    
    users = data.get("users", [])
    projects = data.get("projects", [])
    
    assert len(users) > 0, "No users found in output.json"
    assert len(projects) > 0, "No projects found in output.json"
    
    assert users[0].get("auditLog") == "Created via global hook", \
        f"Expected user auditLog to be 'Created via global hook', got: {users[0].get('auditLog')}"
        
    assert projects[0].get("auditLog") == "Created via local hook", \
        f"Expected project auditLog to be 'Created via local hook', got: {projects[0].get('auditLog')}"
