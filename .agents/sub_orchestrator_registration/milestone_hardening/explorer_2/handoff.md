# Handoff Report – Registration Feature Hardening Investigation

## Observation
- **File:** `backend/src/index.ts` (lines 81‑100) – Defines the **registration endpoint** `POST /api/auth/register`:
  - Validates request body with Joi schema (email, password, optional name).
  - Checks for existing user via `prisma.user.findUnique`.
  - Hashes password with bcrypt and creates a new `User` record.
  - Issues a JWT token for the new user.
- **File:** `backend/prisma/schema.prisma` (lines 34‑48) – Prisma data model for **Registration**:
  - `model Registration` links a `User` to an `Event` (and optionally a `Room`).
  - Contains preference fields (`kosherFood`, `arrivalTime`).
  - Enforces a unique constraint `@@unique([userId, eventId])`.
  - Cascading delete rules on `User` and `Event`.
- **File:** `backend/src/index.ts` (lines 132‑144) – **Preferences route** reads a `Registration` via `prisma.registration.findUnique` using the composite key `userId_eventId`.
- **Environment validation:** JWT secret length ≥ 32 characters (lines 10‑15).
- **Authentication middleware:** Token verification is performed manually in each protected endpoint (e.g., lines 44‑53, 121‑130, 150‑168, etc.).

## Logic Chain
1. **Entry point identification** – The server boots from `backend/src/index.ts`; the registration flow begins at line 81 with the POST `/api/auth/register` route.
2. **Input validation** – Joi schema (lines 82‑86) ensures email format and minimum password length, limiting basic injection vectors.
3. **Duplicate check** – `prisma.user.findUnique` (line 92) prevents account enumeration through early existence checks.
4. **Credential storage** – Passwords are hashed using `bcrypt.hash` (line 94) with a default salt factor of 10, providing resistance against credential cracking.
5. **User creation** – `prisma.user.create` (line 95) persists the new user record; the `User` model (schema.prisma line 10‑16) stores `email`, `passwordHash`, and optional `name`.
6. **Token issuance** – A JWT signed with `jwtSecret` (line 96) is returned to the client, establishing an authenticated session.
7. **Registration data model** – Separate `Registration` model (schema.prisma line 34‑48) is used by other endpoints (e.g., preferences) to link a user to an event and store per‑event preferences.
8. **Data flow** – After registration, the client typically authenticates via `/api/auth` to obtain a token, then uses `/api/preferences` to create or update a `Registration` record (lines 158‑163) which persists event‑specific settings.
9. **Security‑relevant components** –
   - **JWT secret validation** (lines 10‑15) mitigates weak secret attacks.
   - **Password hashing** with bcrypt (line 5 import, line 94 usage).
   - **Cascade delete rules** (schema lines 44‑46) ensure orphaned registrations are removed when a user or event is deleted, reducing stale data exposure.
   - **Unique composite key** on `(userId, eventId)` prevents duplicate registrations.

## Caveats
- Only the primary registration endpoint was examined; auxiliary registration‑related logic (e.g., email verification, rate‑limiting) may reside in other modules not inspected.
- No explicit input sanitization beyond Joi; potential business‑logic flaws (e.g., missing `name` handling) are not evaluated.
- Authentication verification is repeated per‑endpoint; a centralized middleware is absent, increasing the risk of inconsistent checks.
- No audit logging or monitoring around registration events was observed.
- The codebase uses in‑memory accommodation storage; security impact there is outside the registration scope but may affect related workflows.

## Conclusion
The registration feature consists of:
- **Endpoint:** `POST /api/auth/register` (backend/src/index.ts).
- **Data model:** `Registration` Prisma model linking users to events with preference fields.
- **Security controls:** JWT secret length enforcement, bcrypt password hashing, duplicate‑user check, cascade deletes, and a uniqueness constraint.
Potential hardening targets include:
1. Consolidating authentication checks into middleware to avoid gaps.
2. Adding rate‑limiting / CAPTCHA to the registration endpoint to mitigate automated abuse.
3. Implementing email verification and audit logging for registration events.
4. Reviewing JWT secret management (rotation, storage).
5. Ensuring all user‑supplied fields (`name`) are properly sanitized before persistence.

## Verification Method
1. **Static verification:** Open `backend/src/index.ts` and confirm lines 81‑100 match the observed registration route.
2. **Schema verification:** Open `backend/prisma/schema.prisma` and confirm the `Registration` model definition (lines 34‑48).
3. **Functional test:**
   - Run the server (`npm start` or `node dist/index.js`).
   - Issue a `POST` request to `/api/auth/register` with a unique email and password.
   - Expect a 201 response containing a JWT token.
   - Verify that a new record appears in the SQLite database (`dev.db`) under the `User` table.
4. **Security test:** Attempt registration with a weak password (<6 chars) and confirm validation rejects it (400).
5. **Cascade test:** Delete a user via Prisma (or direct DB) and confirm associated `Registration` rows are removed (onDelete: Cascade).

---
*Report generated by Explorer sub‑agent (explorer_2) as part of the hardening milestone.*
