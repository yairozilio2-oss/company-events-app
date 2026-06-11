# SCOPE — Registration Feature

## Overview
The Registration feature enables new users to create an account, verify their email, and activate their profile. It consists of three primary components:
1. **Frontend UI** – registration form, client‑side validation, and verification flow.
2. **Backend API** – endpoints for creating accounts, sending verification emails, and confirming tokens.
3. **Database Schema** – user table, verification token table, and related indexes.

## Boundaries
- **In‑Scope**: All code required to implement the above components, including unit tests for each module.
- **Out‑of‑Scope**: Social login integrations, password‑reset flows, and admin user management (handled in separate features).

## Dependencies
- Existing authentication library (`auth-lib`) for password hashing.
- Email service configuration already present in the project.

## Success Criteria
- End‑to‑end registration flow passes all E2E tests.
- No integrity violations reported by the forensic auditor.
- All unit tests achieve ≥90% coverage for new code.
