import os
import sqlite3
import time
import socket
import pytest
import requests
from xprocess import ProcessStarter
from datetime import datetime, timedelta

PROJECT_DIR = "/home/user/app"
DB_FILE = os.path.join(PROJECT_DIR, "db.sqlite")

@pytest.fixture(scope="session")
def start_app(xprocess):
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
    
    # Wait a moment for Sequelize to sync the schema
    time.sleep(2)
    
    # Seed data
    seed_data()

    yield

    info = xprocess.getinfo(Starter.name)
    info.terminate()

def seed_data():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Find table names (Sequelize might pluralize differently)
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]
    
    author_table = next((t for t in tables if t.lower() in ['author', 'authors']), None)
    article_table = next((t for t in tables if t.lower() in ['article', 'articles']), None)
    comment_table = next((t for t in tables if t.lower() in ['comment', 'comments']), None)
    
    if not author_table or not article_table or not comment_table:
        raise Exception(f"Could not find all required tables. Found: {tables}")
        
    # Get column names to ensure we insert correctly
    cursor.execute(f"PRAGMA table_info({author_table})")
    author_cols = [row[1] for row in cursor.fetchall()]
    
    cursor.execute(f"PRAGMA table_info({article_table})")
    article_cols = [row[1] for row in cursor.fetchall()]
    
    cursor.execute(f"PRAGMA table_info({comment_table})")
    comment_cols = [row[1] for row in cursor.fetchall()]

    # Clear existing data
    cursor.execute(f"DELETE FROM {comment_table}")
    cursor.execute(f"DELETE FROM {article_table}")
    cursor.execute(f"DELETE FROM {author_table}")

    now = datetime.utcnow()
    
    # Insert Author
    # author_cols might have 'id', 'name', 'createdAt', 'updatedAt'
    author_insert = f"INSERT INTO {author_table} (id, name, createdAt, updatedAt) VALUES (?, ?, ?, ?)"
    try:
        cursor.execute(author_insert, (1, "Test Author", now, now))
    except sqlite3.OperationalError:
        # Fallback if columns are different
        cursor.execute(f"INSERT INTO {author_table} (name, createdAt, updatedAt) VALUES (?, ?, ?)", ("Test Author", now, now))
        cursor.execute("SELECT id FROM {author_table} WHERE name='Test Author'")
        author_id = cursor.fetchone()[0]

    # Find foreign key column in Article
    author_fk = next((c for c in article_cols if c.lower() in ['authorid', 'author_id']), None)
    if not author_fk:
        raise Exception(f"Could not find Author foreign key in Article table. Columns: {article_cols}")

    article_ids = []
    # Insert 10 Articles
    for i in range(1, 11):
        created_at = now - timedelta(days=10 - i) # Article 10 is the newest
        cursor.execute(f"INSERT INTO {article_table} (title, content, {author_fk}, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)", 
                       (f"Article {i}", f"Content {i}", 1, created_at, created_at))
        article_ids.append((cursor.lastrowid, created_at))

    # Find foreign key column in Comment
    article_fk = next((c for c in comment_cols if c.lower() in ['articleid', 'article_id']), None)
    if not article_fk:
        raise Exception(f"Could not find Article foreign key in Comment table. Columns: {comment_cols}")

    # Insert 5 Comments per Article
    for article_id, art_time in article_ids:
        for j in range(1, 6):
            # Comments created after the article
            created_at = art_time + timedelta(hours=j) # Comment 5 is the newest
            cursor.execute(f"INSERT INTO {comment_table} (text, {article_fk}, createdAt, updatedAt) VALUES (?, ?, ?, ?)",
                           (f"Comment {j} for Article {article_id}", article_id, created_at, created_at))

    conn.commit()
    conn.close()

def test_fetch_summary(start_app):
    response = requests.get("http://localhost:3000/authors/1/summary")
    assert response.status_code == 200, f"Expected status 200, got {response.status_code}. Response: {response.text}"
    
    data = response.json()
    assert data.get("id") == 1, f"Expected author id 1, got {data.get('id')}"
    assert data.get("name") == "Test Author", f"Expected author name 'Test Author', got {data.get('name')}"
    
    articles = data.get("articles", [])
    assert len(articles) == 5, f"Expected exactly 5 articles, got {len(articles)}"
    
    # Check if articles are the 5 most recent ones (Article 10, 9, 8, 7, 6)
    expected_titles = [f"Article {i}" for i in range(10, 5, -1)]
    actual_titles = [a.get("title") for a in articles]
    assert actual_titles == expected_titles, f"Expected articles {expected_titles}, got {actual_titles}"
    
    for article in articles:
        comments = article.get("comments", [])
        assert len(comments) == 3, f"Expected exactly 3 comments for article {article.get('id')}, got {len(comments)}"
        
        # Check if comments are the 3 most recent ones (Comment 5, 4, 3)
        expected_texts = [f"Comment {j} for Article {article.get('id')}" for j in range(5, 2, -1)]
        actual_texts = [c.get("text") for c in comments]
        assert actual_texts == expected_texts, f"Expected comments {expected_texts}, got {actual_texts}"

def test_fetch_summary_not_found(start_app):
    response = requests.get("http://localhost:3000/authors/999/summary")
    assert response.status_code == 404, f"Expected status 404, got {response.status_code}"
