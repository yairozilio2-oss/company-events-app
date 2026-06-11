# Validation Report: Migration & API Endpoints (CHALLENGER_M2)

## Overview
This report outlines a comprehensive validation strategy and test harnesses for the recent database migration and the newly added API endpoints. The goal is to ensure data integrity, schema correctness, and functional correctness of the APIs while providing automated regression coverage.

## 1. Migration Validation Steps

### 1.1 Pre‑Migration Checks
- **Backup Verification**: Confirm latest backup exists and is restorable.
- **Schema Diff**: Generate a diff between current (`old_schema.sql`) and target (`new_schema.sql`).
- **Row Count Snapshot**: Record row counts for all tables (`SELECT COUNT(*)`).
- **Checksum Sampling**: Compute checksums (e.g., MD5) for a random 5 % sample of rows per table.

### 1.2 Migration Execution
- Run migration script (`migrate.sh` or ORM migration command) in a staging environment.
- Capture stdout/stderr logs.

### 1.3 Post‑Migration Checks
- **Schema Validation**: Re‑run schema diff to ensure target schema matches expected.
- **Row Count Comparison**: Verify row counts are unchanged (or as expected for transformed tables).
- **Checksum Verification**: Re‑compute checksums on the same sampled rows and compare with pre‑migration values.
- **Foreign Key Integrity**: Execute `PRAGMA foreign_key_check` (SQLite) or equivalent for other DBs.
- **Data Consistency Scripts**: Run custom scripts that assert business rules (e.g., no orphaned user records, balances non‑negative).

### 1.4 Rollback Tests
- Trigger rollback procedure.
- Re‑run pre‑migration checks to ensure original state is fully restored.

### 1.5 Automation
- All steps above are codified in a **pytest** suite (`tests/test_migration.py`).
- CI pipeline runs the suite on every PR that modifies migration files.

## 2. API Endpoint Validation

### 2.1 Endpoints Covered
| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/v1/users` | List users |
| POST   | `/api/v1/users` | Create user |
| GET    | `/api/v1/users/{id}` | Retrieve user |
| PUT    | `/api/v1/users/{id}` | Update user |
| DELETE | `/api/v1/users/{id}` | Delete user |

### 2.2 Test Harness Structure (pytest)
```
tests/
├─ conftest.py            # fixtures: test client, DB setup/teardown
├─ test_migration.py      # migration validation (see Section 1)
└─ test_api_endpoints.py # API validation
```

#### conftest.py Highlights
```python
import pytest
from myapp import create_app, db

@pytest.fixture(scope="session")
def app():
    app = create_app(testing=True)
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()
```

#### test_api_endpoints.py Core Tests
```python
import json
import pytest

def test_get_users(client):
    resp = client.get('/api/v1/users')
    assert resp.status_code == 200
    data = resp.get_json()
    assert isinstance(data, list)

def test_create_user_success(client):
    payload = {"name": "Alice", "email": "alice@example.com"}
    resp = client.post('/api/v1/users', json=payload)
    assert resp.status_code == 201
    user = resp.get_json()
    assert user['name'] == 'Alice'
    assert 'id' in user

def test_create_user_invalid(client):
    # Missing required field
    payload = {"email": "bob@example.com"}
    resp = client.post('/api/v1/users', json=payload)
    assert resp.status_code == 400

def test_get_user_not_found(client):
    resp = client.get('/api/v1/users/999999')
    assert resp.status_code == 404

def test_update_user(client):
    # First create
    user = client.post('/api/v1/users', json={"name": "Carol", "email": "c@example.com"}).get_json()
    uid = user['id']
    # Update
    resp = client.put(f'/api/v1/users/{uid}', json={"name": "Carol Updated"})
    assert resp.status_code == 200
    updated = resp.get_json()
    assert updated['name'] == 'Carol Updated'

def test_delete_user(client):
    user = client.post('/api/v1/users', json={"name": "Dave", "email": "d@example.com"}).get_json()
    uid = user['id']
    resp = client.delete(f'/api/v1/users/{uid}')
    assert resp.status_code == 204
    # Verify deletion
    resp = client.get(f'/api/v1/users/{uid}')
    assert resp.status_code == 404
```

### 2.3 Contract & Schema Validation
- Use **schemathesis** or **pydantic** models to automatically validate request/response schemas against OpenAPI spec.
- Example snippet in `tests/test_schema.py`:
```python
import schemathesis

schema = schemathesis.from_path('openapi.yaml')

@schema.parametrize()
def test_endpoint(case):
    case.call()
    case.validate_response()
```

### 2.4 Performance & Load Checks
- Simple load test using **locust** targeting each endpoint with 100 concurrent users for 30 seconds.
- Assert average response time < 200 ms and error rate < 1 %.

### 2.5 Security Checks
- Verify that unauthenticated requests to protected endpoints return 401.
- Test rate‑limiting headers (`X-RateLimit-Remaining`).

## 3. CI Integration
- Add the test suite to `pytest` command in CI.
- Fail the pipeline on any migration checksum mismatch or API contract violation.
- Generate a JUnit XML report (`pytest --junitxml=reports/m2_validation.xml`).

## 4. Reporting
- The CI job uploads the XML report and a summary markdown (`CHALLENGER_M2.md`).
- On failure, the CI job posts a comment with the failing test names and stack traces.

---
**Prepared by:** Challenger Sub‑Agent
**Timestamp:** 2026-06-11T01:43:27+03:00
