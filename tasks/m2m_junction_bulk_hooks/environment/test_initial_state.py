import os
import shutil

PROJECT_DIR = "/home/user/myproject"

def test_node_available():
    assert shutil.which("node") is not None, "Node.js (node) is not found in PATH."
    assert shutil.which("npm") is not None, "npm is not found in PATH."

def test_project_dir_exists():
    assert os.path.isdir(PROJECT_DIR), f"Project directory {PROJECT_DIR} does not exist."

def test_package_json_exists():
    package_json_path = os.path.join(PROJECT_DIR, "package.json")
    assert os.path.isfile(package_json_path), f"package.json is missing in {PROJECT_DIR}. Initial state must contain package.json."