import pytest
import os
import socket
import subprocess
import requests
from xprocess import ProcessStarter

PROJECT_DIR = "/home/user/myproject"
BASE_URL = "http://localhost:3000"

@pytest.fixture(scope="session")
def start_app(xprocess):
    # Run npm install before starting the app
    subprocess.run(["npm", "install"], cwd=PROJECT_DIR, check=True)

    class Starter(ProcessStarter):
        name = "start_app"
        args = ["node", "index.js"]
        env = os.environ.copy()
        popen_kwargs = {
            "cwd": PROJECT_DIR,
            "text": True,
        }
        timeout = 60
        terminate_on_interrupt = True

        def startup_check(self):
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                return s.connect_ex(("localhost", 3000)) == 0

    xprocess.ensure(Starter.name, Starter)
    yield
    info = xprocess.getinfo(Starter.name)
    info.terminate()

def test_bulk_create_users(start_app):
    url = f"{BASE_URL}/users/bulk"
    payload = [
        {"username": "Alice Smith", "password": "secret1"},
        {"username": "Bob Jones", "password": "secret2"}
    ]
    response = requests.post(url, json=payload)
    assert response.status_code == 201, f"Expected status 201, got {response.status_code}. Response: {response.text}"
    
    users = response.json()
    assert isinstance(users, list), "Expected response to be a JSON array."
    assert len(users) == 2, f"Expected 2 users, got {len(users)}."
    
    # Check Alice
    alice = next((u for u in users if u.get("username") == "Alice Smith"), None)
    assert alice is not None, "Alice Smith not found in response."
    assert alice.get("slug") == "alice-smith", f"Expected slug 'alice-smith', got {alice.get('slug')}"
    expected_hash_alice = "2b5762858055627f12eb62a7407b7136c3400d3d57820a40f7f3e1b305ee8915"
    assert alice.get("password") == expected_hash_alice, f"Expected hashed password {expected_hash_alice}, got {alice.get('password')}"
    
    # Check Bob
    bob = next((u for u in users if u.get("username") == "Bob Jones"), None)
    assert bob is not None, "Bob Jones not found in response."
    assert bob.get("slug") == "bob-jones", f"Expected slug 'bob-jones', got {bob.get('slug')}"
    expected_hash_bob = "12781d0901e13e5519db1b92019b8bd2a433604f5f8b4d1c4a037e937d57c83f"
    assert bob.get("password") == expected_hash_bob, f"Expected hashed password {expected_hash_bob}, got {bob.get('password')}"

    # Save alice_id for the next test by setting it on pytest
    pytest.alice_id = alice.get("id")

def test_create_article_for_alice(start_app):
    assert hasattr(pytest, "alice_id"), "alice_id not set from previous test."
    alice_id = pytest.alice_id
    
    url = f"{BASE_URL}/users/{alice_id}/articles"
    payload = {"title": "Sequelize Hooks", "content": "Hooks are great!"}
    response = requests.post(url, json=payload)
    assert response.status_code == 201, f"Expected status 201, got {response.status_code}. Response: {response.text}"

def test_get_users_with_articles(start_app):
    url = f"{BASE_URL}/users"
    response = requests.get(url)
    assert response.status_code == 200, f"Expected status 200, got {response.status_code}. Response: {response.text}"
    
    users = response.json()
    assert isinstance(users, list), "Expected response to be a JSON array."
    
    alice = next((u for u in users if u.get("username") == "Alice Smith"), None)
    assert alice is not None, "Alice Smith not found in users list."
    assert "articles" in alice, "Alice is missing 'articles' property."
    assert isinstance(alice["articles"], list), "Alice's 'articles' property should be a list."
    assert len(alice["articles"]) == 1, f"Expected Alice to have 1 article, got {len(alice['articles'])}."
    assert alice["articles"][0].get("title") == "Sequelize Hooks", "Alice's article title does not match."
    
    bob = next((u for u in users if u.get("username") == "Bob Jones"), None)
    assert bob is not None, "Bob Jones not found in users list."
    assert "articles" in bob, "Bob is missing 'articles' property."
    assert isinstance(bob["articles"], list), "Bob's 'articles' property should be a list."
    assert len(bob["articles"]) == 0, f"Expected Bob to have 0 articles, got {len(bob['articles'])}."
