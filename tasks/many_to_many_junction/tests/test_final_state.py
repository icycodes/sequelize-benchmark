import os
import requests
import pytest
import socket
from xprocess import ProcessStarter

PROJECT_DIR = "/home/user/project"
BASE_URL = "http://localhost:3000"

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
        timeout = 180
        terminate_on_interrupt = True

        def startup_check(self):
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                return s.connect_ex(("localhost", 3000)) == 0

    xprocess.ensure(Starter.name, Starter)
    yield
    info = xprocess.getinfo(Starter.name)
    info.terminate()

def test_api_workflow(start_app):
    # 1. Create Student
    resp = requests.post(f"{BASE_URL}/students", json={"name": "Alice"})
    assert resp.status_code == 201, f"Expected status 201 for POST /students, got {resp.status_code}"
    student_data = resp.json()
    assert "name" in student_data and student_data["name"] == "Alice", "Expected 'name': 'Alice' in response"
    assert "id" in student_data, "Expected 'id' in response"
    student_id = student_data["id"]

    # 2. Create Course
    resp = requests.post(f"{BASE_URL}/courses", json={"title": "Database Systems"})
    assert resp.status_code == 201, f"Expected status 201 for POST /courses, got {resp.status_code}"
    course_data = resp.json()
    assert "title" in course_data and course_data["title"] == "Database Systems", "Expected 'title': 'Database Systems' in response"
    assert "id" in course_data, "Expected 'id' in response"
    course_id = course_data["id"]

    # 3. Create Enrollment
    resp = requests.post(f"{BASE_URL}/enrollments", json={"studentId": student_id, "courseId": course_id, "grade": "A"})
    assert resp.status_code == 201, f"Expected status 201 for POST /enrollments, got {resp.status_code}"

    # 4. Get Student Courses
    resp = requests.get(f"{BASE_URL}/students/{student_id}/courses")
    assert resp.status_code == 200, f"Expected status 200 for GET /students/{{id}}/courses, got {resp.status_code}"
    student_courses = resp.json()
    assert student_courses.get("name") == "Alice", "Expected student name 'Alice'"
    courses = student_courses.get("Courses", [])
    assert len(courses) > 0, "Expected at least one course in Courses array"
    
    course = next((c for c in courses if c.get("title") == "Database Systems"), None)
    assert course is not None, "Expected course 'Database Systems' in student's courses"
    
    enrollment = course.get("Enrollment")
    assert enrollment is not None, "Expected 'Enrollment' junction object in course"
    assert enrollment.get("grade") == "A", f"Expected grade 'A' in Enrollment, got {enrollment.get('grade')}"
