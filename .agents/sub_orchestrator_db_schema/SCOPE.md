# SCOPE — Database Schema for Registration Feature

## Objective
Design a replacement relational database schema for the user Registration feature, covering user accounts, profile information, and verification data.

## Requirements
- Support creation, update, and deletion of user accounts.
- Store email, password hash, verification tokens, timestamps.
- Allow optional profile fields (first name, last name, phone).
- Ensure referential integrity and appropriate indexing for lookup by email and verification token.
- Provide migration plan from existing schema (if any) to new schema.

## Deliverables
1. Entity‑Relationship diagram description.
2. SQL DDL statements for tables, indexes, constraints.
3. Migration script outline (up/down).
4. Validation queries to verify data integrity.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|--------------|--------|
| 1 | Schema Design | Full schema definition | none | PLANNED |
| 2 | Migration Plan | Scripts to migrate data | 1 | PLANNED |
| 3 | Validation Tests | SQL queries & checks | 1,2 | PLANNED |

## Acceptance Criteria
- All tables created without errors on target DB (e.g., PostgreSQL).
- Migration runs without data loss on sample dataset.
- Validation queries return expected results.
- Documentation of schema in README.
