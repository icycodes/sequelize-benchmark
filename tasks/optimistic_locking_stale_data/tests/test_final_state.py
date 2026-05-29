import os
import subprocess
import pytest

PROJECT_DIR = "/home/user/project"

def run_optimistic_transfer(initial, amount1, amount2):
    """Run the optimistic_transfer.js script with arguments."""
    result = subprocess.run(
        ["node", "optimistic_transfer.js", str(initial), str(amount1), str(amount2)],
        capture_output=True,
        text=True,
        cwd=PROJECT_DIR
    )
    return result

def test_optimistic_transfer_100_50_30():
    """Verify concurrent update with initial 100, adding 50 and 30."""
    result = run_optimistic_transfer(100, 50, 30)
    assert result.returncode == 0, f"Script failed: {result.stderr}"
    assert "Final balance: 180" in result.stdout, \
        f"Expected 'Final balance: 180' in output, got: {result.stdout}"

def test_optimistic_transfer_500_200_150():
    """Verify concurrent update with initial 500, adding 200 and 150."""
    result = run_optimistic_transfer(500, 200, 150)
    assert result.returncode == 0, f"Script failed: {result.stderr}"
    assert "Final balance: 850" in result.stdout, \
        f"Expected 'Final balance: 850' in output, got: {result.stdout}"

def test_optimistic_transfer_0_10_20():
    """Verify concurrent update with initial 0, adding 10 and 20."""
    result = run_optimistic_transfer(0, 10, 20)
    assert result.returncode == 0, f"Script failed: {result.stderr}"
    assert "Final balance: 30" in result.stdout, \
        f"Expected 'Final balance: 30' in output, got: {result.stdout}"
