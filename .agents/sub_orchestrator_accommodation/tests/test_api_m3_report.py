# test_api_m3_report.py
"""Tests for the API Milestone 3 implementation report.
These tests verify that the mandatory integrity warning is present in the report.
"""
import pathlib
import pytest

REPORT_PATH = pathlib.Path(r"c:/Users/yairo/OneDrive/Desktop/new-project/.agents/sub_orchestrator_accommodation/API_M3_IMPLEMENTATION_REPORT.md")

@pytest.fixture(scope="module")
def report_content():
    assert REPORT_PATH.is_file(), f"Report file not found at {REPORT_PATH}"
    return REPORT_PATH.read_text(encoding="utf-8")

def test_integrity_warning_present(report_content):
    """Ensure the mandatory integrity warning is included verbatim."""
    warning = (
        "DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, "
        "create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor "
        "will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected."
    )
    assert warning in report_content, "Integrity warning not found in the implementation report"
