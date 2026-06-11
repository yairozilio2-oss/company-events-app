# PROJECT — Database Schema Replacement for Registration Feature

## Overview
This project defines the replacement relational database schema for the user Registration feature, including table definitions, migration strategy, and validation tests.

## Code Layout
- No source code files are created in this repository; the deliverables are SQL scripts and documentation located in the `db_schema/` directory.

## Milestones
| # | Name | Description | Dependencies | Status |
|---|------|-------------|--------------|--------|
| 1 | Schema Design | Define tables, columns, constraints, indexes. | none | PLANNED |
| 2 | Migration Plan | Create up/down migration scripts. | 1 | PLANNED |
| 3 | Validation Tests | Write SQL queries to verify integrity. | 1,2 | PLANNED |

## Interface Contracts
- Not applicable (database layer).

## Acceptance Criteria
- All tables created without errors on target DB (e.g., PostgreSQL).
- Migration runs without data loss on sample dataset.
- Validation queries return expected results.
- Documentation of schema in README.
