# Registration Feature Database Schema Analysis

## Observation
- The project uses Prisma with SQLite as the datasource (see `backend/prisma/schema.prisma`).
- Current models relevant to registration are:
  - **User** – contains personal info and a relation `registrations` to `Registration`.
  - **Event** – describes an event and has a relation `registrations`.
  - **Registration** – links a `User` to an `Event` (and optionally a `Room`). It currently includes:
    ```prisma
    id          Int      @id @default(autoincrement())
    userId      Int
    eventId     Int
    roomId      Int?    
    kosherFood  Boolean  @default(false)
    arrivalTime String?
    ```
    plus foreign‑key relations and a uniqueness constraint on `[userId, eventId]`.
- No explicit status, timestamps, payment information, or additional preference fields are defined.
- Existing auxiliary models (`Preference`, `Accommodation`, `Room`) do not cover registration‑specific workflow data.

## Logic Chain
1. **Requirement Identification**: A typical registration workflow includes:
   - Tracking when a user registers (`createdAt`).
   - Updating the registration status (e.g., `pending`, `confirmed`, `cancelled`).
   - Optionally storing payment details (`paid`, `paymentId`).
   - Capturing special requests or notes from the registrant.
2. **Schema Gap Detection**: The current `Registration` model lacks fields for status, timestamps, and payment info, meaning the application cannot represent these lifecycle aspects.
3. **Impact Assessment**: Without these fields, the backend cannot:
   - Query registrations by status (e.g., list all pending registrations).
   - Audit when a registration was created/modified.
   - Record whether a user has paid or link to an external payment record.
4. **Design Consideration**: Adding fields directly to `Registration` is the simplest approach. If payment handling becomes complex, a separate `Payment` model could be introduced, but for the early stage a few scalar columns suffice.
5. **Proposed Schema Additions**:
   - Add `status` as an enum (`pending`, `confirmed`, `cancelled`).
   - Add `createdAt` and `updatedAt` with `@default(now())` and `@updatedAt` respectively.
   - Add optional `paid` (Boolean) and `paymentId` (String) for payment tracking.
   - Add optional `specialRequests` (String) for additional registrant notes.
6. **Migration Impact**: Adding non‑nullable fields with defaults (`status` default `pending`, timestamps) will not break existing data. Nullable fields (`paid`, `paymentId`, `specialRequests`) are safe as they accept null.

## Caveats
- The current datasource is SQLite; certain enum handling differs from PostgreSQL but Prisma abstracts this correctly.
- If the project later switches to a relational DB that supports enum types natively, the `status` enum definition may need adaptation.
- Payment integration is outside the current codebase; the `paymentId` field assumes an external payment service identifier.
- No existing tests verify registration workflows; adding these schema changes will require migration scripts and updated Prisma client generation.

## Conclusion
The existing schema provides the core relational links for registration but lacks essential workflow metadata. To fully support the Registration feature, the `Registration` model should be extended with status, timestamps, payment tracking, and a free‑text notes column. These changes are minimally invasive, maintain backward compatibility, and enable the required business logic.

## Verification Method
1. Run `npx prisma migrate dev --name add_registration_fields` in the `backend` directory.
2. Verify the generated migration SQL adds the new columns with appropriate defaults.
3. Run the test suite (`npm test` or `npx jest`) to ensure no breaking changes.
4. Use the Prisma client in a REPL (`npx prisma studio`) to create a registration and confirm that default values are populated.
