import os
import subprocess
import pytest

PROJECT_DIR = "/home/user/myproject"
DB_FILE = os.path.join(PROJECT_DIR, "database.sqlite")

@pytest.fixture(scope="session", autouse=True)
def setup_environment():
    """Ensure dependencies are installed and clean up any existing database before testing."""
    # Run npm install
    subprocess.run(["npm", "install"], cwd=PROJECT_DIR, check=False)
    
    # Remove database if it exists
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)

def test_script_execution_and_output():
    """Run the script and verify it outputs the correct user count."""
    result = subprocess.run(
        ["node", "index.js"],
        cwd=PROJECT_DIR,
        capture_output=True,
        text=True
    )
    
    assert result.returncode == 0, f"Script execution failed with error: {result.stderr}"
    assert "User count: 0" in result.stdout, f"Expected 'User count: 0' in stdout, but got: {result.stdout}"

def test_database_state():
    """Verify that the database is actually empty, ensuring the transaction rolled back."""
    # This inline script connects to the SQLite database and checks the count of the Users/users table.
    verify_script = """
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({ dialect: 'sqlite', storage: './database.sqlite', logging: false });

sequelize.query('SELECT count(*) as count FROM Users')
  .then(([results]) => {
    console.log('DB Count:', results[0].count);
    process.exit(0);
  })
  .catch(() => {
    sequelize.query('SELECT count(*) as count FROM users')
      .then(([results]) => {
        console.log('DB Count:', results[0].count);
        process.exit(0);
      })
      .catch((err) => {
        console.error('Failed to query database:', err.message);
        process.exit(1);
      });
  });
"""
    
    result = subprocess.run(
        ["node", "-e", verify_script],
        cwd=PROJECT_DIR,
        capture_output=True,
        text=True
    )
    
    assert result.returncode == 0, f"Database verification script failed: {result.stderr}"
    assert "DB Count: 0" in result.stdout, f"Expected 'DB Count: 0' in stdout, but got: {result.stdout}"
