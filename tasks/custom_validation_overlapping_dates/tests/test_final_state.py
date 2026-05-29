import os
import socket
import pytest
import requests
from xprocess import ProcessStarter

PROJECT_DIR = "/home/user/project"
API_URL = "http://localhost:3000/reservations"

@pytest.fixture(scope="session")
def start_app(xprocess):
    """
    Starts the node service using xprocess. Confirms readiness via port check.
    """
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
            """Returns True if port 3000 is accepting connections."""
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                return s.connect_ex(("localhost", 3000)) == 0

    xprocess.ensure(Starter.name, Starter)
    yield
    info = xprocess.getinfo(Starter.name)
    info.terminate()

def test_api_reservations(start_app):
    # 1. Create First Reservation
    payload1 = {"roomId": 1, "startDate": "2023-10-01", "endDate": "2023-10-10"}
    res1 = requests.post(API_URL, json=payload1)
    assert res1.status_code == 201, f"Expected 201 Created for first reservation, got {res1.status_code}"

    # 2. Create Overlapping Reservation (Partial Overlap)
    payload2 = {"roomId": 1, "startDate": "2023-10-05", "endDate": "2023-10-15"}
    res2 = requests.post(API_URL, json=payload2)
    assert res2.status_code == 400, f"Expected 400 Bad Request for partial overlap, got {res2.status_code}"

    # 3. Create Overlapping Reservation (Inside Overlap)
    payload3 = {"roomId": 1, "startDate": "2023-10-02", "endDate": "2023-10-08"}
    res3 = requests.post(API_URL, json=payload3)
    assert res3.status_code == 400, f"Expected 400 Bad Request for inside overlap, got {res3.status_code}"

    # 4. Create Overlapping Reservation (Exact Match)
    payload4 = {"roomId": 1, "startDate": "2023-10-01", "endDate": "2023-10-10"}
    res4 = requests.post(API_URL, json=payload4)
    assert res4.status_code == 400, f"Expected 400 Bad Request for exact match overlap, got {res4.status_code}"

    # 5. Create Non-Overlapping Reservation
    payload5 = {"roomId": 1, "startDate": "2023-10-11", "endDate": "2023-10-20"}
    res5 = requests.post(API_URL, json=payload5)
    assert res5.status_code == 201, f"Expected 201 Created for non-overlapping reservation, got {res5.status_code}"

    # 6. Create Overlapping Reservation for a Different Room
    payload6 = {"roomId": 2, "startDate": "2023-10-05", "endDate": "2023-10-15"}
    res6 = requests.post(API_URL, json=payload6)
    assert res6.status_code == 201, f"Expected 201 Created for different room reservation, got {res6.status_code}"

    # 7. Create Invalid Date Range
    payload7 = {"roomId": 1, "startDate": "2023-10-25", "endDate": "2023-10-20"}
    res7 = requests.post(API_URL, json=payload7)
    assert res7.status_code == 400, f"Expected 400 Bad Request for invalid date range, got {res7.status_code}"

    # 8. List Reservations
    res8 = requests.get(API_URL)
    assert res8.status_code == 200, f"Expected 200 OK for listing reservations, got {res8.status_code}"
    
    reservations = res8.json()
    assert isinstance(reservations, list), "Expected response to be a JSON array"
    assert len(reservations) == 3, f"Expected exactly 3 reservations, got {len(reservations)}"
