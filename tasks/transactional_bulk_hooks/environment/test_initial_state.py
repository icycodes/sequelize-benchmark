import os
import shutil

def test_node_available():
    assert shutil.which("node") is not None, "Node.js is not installed."
    assert shutil.which("npm") is not None, "npm is not installed."

def test_project_directory_exists():
    assert os.path.isdir("/home/user/myproject"), "Project directory /home/user/myproject does not exist."

def test_package_json_exists():
    assert os.path.isfile("/home/user/myproject/package.json"), "package.json does not exist in the project directory."
