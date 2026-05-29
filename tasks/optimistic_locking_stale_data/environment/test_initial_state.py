import os
import shutil

def test_node_available():
    assert shutil.which("node") is not None, "Node.js binary not found in PATH."

def test_npm_available():
    assert shutil.which("npm") is not None, "npm binary not found in PATH."

def test_project_dir_exists():
    assert os.path.isdir("/home/user/project"), "Project directory /home/user/project does not exist."
