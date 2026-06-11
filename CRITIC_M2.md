# Critique Report: Milestone 2 Migration Scripts & Updated PROJECT.md

**Prepared by:** Teamwork sub‑agent (critic role)
**Date:** 2026‑06‑11

---

## 1. Schema Evaluation (migration.sql)

### 1.1. General Observations
- Tables defined: `User`, `Event`, `Registration`, `Room`, `Preference`.
- Primary keys are `INTEGER AUTOINCREMENT` – acceptable for SQLite but may need explicit `BIGINT` for PostgreSQL.
- All foreign‑key columns are `NOT NULL` **except** `Registration.roomId` and `Preference` fields that are optional.

### 1.2. Potential Issues & Missing Constraints
| Issue | Location | Impact | Suggested Remedy |
|-------|----------|--------|------------------|
| **Gender value integrity** | `User.gender`, `Room.gender` | Free‑form strings allow garbage values, breaking gender‑based allocation logic. | Add a `CHECK` constraint restricting to an enum (e.g. `'male','female','nonbinary','other'`). |
| **Event‑Room consistency** | `Room.eventId` (FK) **and** `Registration.eventId` | A registration could reference a `roomId` that belongs to a *different* event, creating orphaned allocations. | Add a composite `CHECK` or a trigger that ensures `Registration.eventId = (SELECT eventId FROM Room WHERE id = roomId)` when `roomId` is not null. |
| **Capacity enforcement** | `Room.capacity` | No DB‑level guard preventing more registrations than capacity. | Create a trigger that blocks insertion into `Registration` when the count of registrations for a room reaches its capacity. |
| **Unique constraints on business keys** | `User.email` (already unique) – good. `Event.name` / `Event.date` | Duplicate events could be created unintentionally. | Add a unique index on `(name, date)`. |
| **Missing audit columns** | All tables | Hard to trace changes, test failures, or data‑migration bugs. | Add `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP` and `updated_at TIMESTAMP` with `ON UPDATE` logic. |
| **`Registration.arrivalTime` type** | `TEXT` | Storing time as free text hinders ordering and validation. | Use `DATETIME` (or `TIME`) type. |
| **Cascade/delete semantics** | `Registration.roomId` → `Room.id` uses `ON DELETE SET NULL`. | Deleting a room clears the room reference but leaves a registration that still points to the same event – may need business‑level cleanup. | Consider `ON DELETE RESTRICT` or add a trigger to delete related registrations. |
| **Indexing foreign keys** | All FK columns | SQLite auto‑creates indexes for PKs but not always for FKs, leading to slower joins. | Add explicit indexes on `userId`, `eventId`, `roomId` in `Registration`; on `eventId` in `Room`; on `requesterId`, `requestedId`, `eventId` in `Preference` (some are covered by unique indexes, but separate indexes improve look‑ups). |
| **Potential naming conflict** | Table `Preference` – ambiguous purpose (preference vs. matching request). | Might confuse future developers. | Rename to `MatchRequest` or add a comment clarifying semantics. |

---

## 2. API Design Evaluation (PROJECT.md – Interface Contracts)

### 2.1. Endpoint Coverage Gaps
| Missing / Incomplete Feature | Reason | Recommendation |
|------------------------------|--------|----------------|
| **User management** (`POST /api/users`, `GET /api/users/:id`) | Only auth endpoint is listed. CRUD for users is required for admin tools and tests. | Add explicit user CRUD endpoints with proper RBAC. |
| **Event management** (`POST /api/events`, `PUT /api/events/:id`) | Only read (`/api/events`) is present. Creating/updating events is needed for M2 and later milestones. | Define create/update/delete endpoints. |
| **Room management** (`GET /api/rooms`, `POST /api/rooms`) | Not listed, yet `Room` schema exists and allocation logic depends on rooms. | Add endpoints to list/create rooms and to query capacity. |
| **Preference status transition** (`PATCH /api/preferences/:id`) | No endpoint to accept/reject a preference request. | Provide a PATCH endpoint that updates `status` with validation (only `'pending' → 'accepted'/'rejected'`). |
| **Pagination / Filtering** | All list endpoints return full collections. | Introduce query parameters (`?page=`, `?limit=`, `?eventId=`) to avoid large payloads. |

### 2.2. Security & Authorization Concerns
- Auth endpoint listed, but no description of token handling, expiration, or role‑based access control.
- Endpoints that modify data (`/api/preferences`, `/api/roommates`, `/api/allocate`) should require proper authentication and checks that the caller is the owning user or an admin.
- No mention of input validation (e.g., email format, event date validation). This opens injection risks.

### 2.3. Consistency & Naming
- Mixed use of singular (`/api/auth`) and plural (`/api/events`). Keep convention consistent – usually plural for resources.
- `/api/roommates` is vague; it handles both sending a request and accepting a request. Split into `/api/requests` (POST) and `/api/requests/:id/accept` (POST) for clarity.
- `/api/allocate` is a verb‑based endpoint; consider `/api/allocations/run` or a POST to `/api/allocations` for RESTful style.

### 2.4. Error Handling & Responses
- No specifications for HTTP status codes, error payload format, or success response shapes. Recommend a standardized schema, e.g., `{ success: true, data: ..., error: null }` with appropriate `4xx/5xx` codes.

---

## 3. Recommendations & Next Steps
1. **Update migration scripts** to include the missing constraints and triggers outlined in Section 1.2. Commit the revised `migration.sql`.
2. **Amend `PROJECT.md`** to reflect the expanded API surface, security considerations, and naming conventions (see Section 2).
3. Write unit tests for the new constraints (e.g., gender enum, capacity trigger) and for API validation (auth, role checks).
4. Add a “Database Auditing” section to `PROJECT.md` describing `created_at` / `updated_at` columns.
5. Ensure any generated client SDKs consume the paginated list endpoints.

---

*This critique is intended for the development team to guide corrective work before moving to Milestone 3.*
