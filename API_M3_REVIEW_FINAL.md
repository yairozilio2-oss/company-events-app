# API M3 Review Report

**Reviewed file**: `backend/src/index.ts`
**Test files**: `backend/src/__tests__/auth.test.ts`

## Review Summary

- **Verdict**: **REQUEST_CHANGES** – critical integrity concerns found in JWT handling and input validation, and insufficient test coverage.

## Findings

### Critical Finding 1 – JWT Secret Validation Incomplete
- **What**: The code validates that `JWT_SECRET` is present and at least 32 characters long (lines 10‑15), but there is no enforcement of a strong algorithm nor rotation strategy. The secret is read directly from the environment and used with `jsonwebtoken` defaults, which may allow weaker algorithms (e.g., `none`). There is also no explicit error handling for malformed tokens beyond a generic 401 response.
- **Where**: `backend/src/index.ts` lines 10‑15, 49‑53, 84‑88, 113‑117, 145‑150.
- **Why**: Using the default algorithm may expose the service to algorithm‑confusion attacks. Moreover, the secret length check alone does not guarantee entropy; a 32‑character string could still be predictable.
- **Suggestion**: 
  1. Explicitly set the algorithm when signing/verifying (e.g., `jwt.sign(..., { algorithm: 'HS256' })`).
  2. Enforce a minimum entropy check (e.g., use a cryptographically‑secure random generator for the secret in deployment).
  3. Add middleware that centralises JWT verification and returns consistent error messages.

### Critical Finding 2 – Missing Joi Validation on Authentication Endpoints
- **What**: Joi validation is applied only to `/api/roommates` and `/api/allocate`. The login (`POST /api/auth`) and token check (`GET /api/auth`) accept raw `req.body` / headers without schema validation.
- **Where**: `backend/src/index.ts` lines 56‑73 (login) and 43‑54 (token check).
- **Why**: Unvalidated input can lead to injection attacks, malformed payloads, or unexpected runtime errors. For example, an attacker could supply excessively long strings for `email` or `password`, potentially causing performance degradation or denial‑of‑service.
- **Suggestion**: Add Joi schemas for login payload (e.g., `email: Joi.string().email().required()`, `password: Joi.string().min(8).required()`) and for the `Authorization` header format.

### Major Finding 3 – Insufficient Auth Test Coverage
- **What**: The existing test suite only checks that a POST to `/api/auth` without credentials returns 401 (lines 4‑9 of `auth.test.ts`). There are no tests for:
  - Successful login returning a valid JWT.
  - Token verification logic (valid, expired, malformed tokens).
  - Edge cases such as missing `JWT_SECRET` or weak secret.
- **Why**: Without comprehensive tests, regressions in authentication logic may go undetected, compromising security.
- **Suggestion**: Extend the test suite to cover:
  1. Successful login with a known user (mock Prisma responses).
  2. Verification of the returned token using the same secret.
  3. Expired token handling.
  4. Invalid token signatures.

### Minor Finding 4 – Hard‑coded Port for Testing
- **What**: The server defaults to `process.env.PORT || 3002` (line 18). While acceptable for development, the test environment may unintentionally bind to a fixed port and cause conflicts.
- **Suggestion**: Allow the port to be injected via test setup or use a random free port in CI.

## Verified Claims
- **JWT secret length check** → verified by reading source lines 10‑15.
- **Joi usage limited to roommates/allocate** → verified by searching for `Joi` occurrences (lines 185‑206).
- **Auth test only covers unauthorized case** → verified by reading `auth.test.ts` (lines 1‑11).

## Coverage Gaps
- No validation of request bodies for auth routes.
- No tests for token creation/verification.
- No audit of secret handling beyond length.

## Conclusion
The implementation contains critical security gaps in JWT handling and missing input validation for authentication endpoints, and the test suite does not adequately verify authentication behavior. These issues must be addressed before the API can be considered production‑ready.

## Verification Method
1. Review `backend/src/index.ts` for JWT handling and Joi usage.
2. Inspect test files under `backend/src/__tests__/`.
3. Run `npm test` (or `yarn test`) to confirm current test coverage.
4. Verify that additional test cases are added and that the code is updated per the suggestions.

*End of Report*
