# Scope: Accommodation Management Data Model

## Overview
This document outlines the data model design for the **accommodation management** feature referenced in the project's milestones (M3: Roommate Selection, M4: Admin & Auto-Allocation). It defines the core entities, their attributes, and relationships needed to support:
- Employee preferences and gender constraints
- Roommate request workflow (bidirectional approval, locking)
- Automatic and manual room allocation
- Administrative oversight and reporting

## Core Entities
| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| **User** | Employee using the system | `id` (PK), `email`, `full_name`, `department`, `gender` (enum: Male/Female/Other), `role` (enum: Employee/Admin) |
| **Event** | Specific accommodation period (e.g., Summer 2026) | `id` (PK), `name`, `start_date`, `end_date`, `location` |
| **Preference** | Employee's accommodation preferences for an event | `id` (PK), `user_id` (FK→User.id), `event_id` (FK→Event.id), `preferred_room_type`, `roommate_gender_preference` (enum), `notes` |
| **Room** | Physical accommodation unit | `id` (PK), `event_id` (FK→Event.id), `room_number`, `capacity` (int), `room_type`, `gender_allowed` (enum) |
| **RoommateRequest** | Request from one employee to another to share a room | `id` (PK), `requester_id` (FK→User.id), `target_id` (FK→User.id), `event_id` (FK→Event.id), `status` (enum: Pending/Accepted/Rejected/Cancelled), `locked_at` (timestamp) |
| **Allocation** | Assigned room for a user (or a pair) | `id` (PK), `user_id` (FK→User.id), `room_id` (FK→Room.id), `event_id` (FK→Event.id), `assigned_at` (timestamp) |
| **AdminActionLog** | Audit trail for admin operations | `id` (PK), `admin_id` (FK→User.id), `action_type`, `details`, `timestamp` |

## Relationships
- **User ⇢ Preference**: One‑to‑Many (a user may have preferences for multiple events).
- **Event ⇢ Room**: One‑to‑Many (rooms belong to an event).
- **User ⇢ RoommateRequest**: Two distinct relations – as `requester` and as `target`.
- **User ⇢ Allocation**: One‑to‑Many (a user may have multiple allocations across events).
- **Room ⇢ Allocation**: One‑to‑Many (a room can host multiple users up to its capacity).
- **AdminActionLog ⇢ User**: Many‑to‑One (admin who performed the action).

## Constraints & Business Rules
1. **Gender Compatibility**: When allocating rooms, ensure that the room's `gender_allowed` matches the user's `gender` and any `roommate_gender_preference` in `Preference`.
2. **Capacity Enforcement**: The number of `Allocation` rows referencing a `Room` must not exceed `capacity`.
3. **Bidirectional Acceptance**: A `RoommateRequest` becomes `Accepted` only when **both** users have a corresponding request with status `Accepted` and the `locked_at` timestamp is set, preventing further changes.
4. **Locking**: Once a request reaches `Accepted`, the pair is locked; further requests involving either user for the same event are rejected.
5. **Auto‑Allocation Algorithm**: Reads `Preference` and existing `RoommateRequest` statuses to compute optimal assignments, respecting all constraints.

## Suggested Implementation
- Use a relational database (PostgreSQL recommended) with foreign‑key constraints as defined above.
- Define ORM models (e.g., Sequelize for Node.js or SQLAlchemy for Python) mirroring these entities.
- Expose CRUD endpoints in the API (`/api/preferences`, `/api/roommates`, `/api/allocate`) that operate on these tables.
- Add database migrations to create the schema.

## Next Steps
- Review this model with stakeholders for any missing attributes.
- Create migration scripts in the `backend/` folder.
- Update API contracts in `PROJECT.md` to reflect new endpoints.
