# Backend API Requirements Report – Registration Feature

## Observation
- **File examined**: `backend/src/index.ts` (lines 1‑258). The file defines the Express server, JWT handling, Prisma ORM usage, and several API routes.
- **Key Registration endpoint**: `POST /api/auth/register` (lines 81‑101).
- **Related data models**: `User` (via Prisma `prisma.user`), `Registration` (used in preferences routes), `Preference`, `Accommodation` (in‑memory), and `Roommate` (placeholder).
- **Validation library**: `Joi` is used throughout for request payload validation.
- **Error handling**: Consistent pattern—input validation errors → 400; business logic conflicts (e.g., existing user) → 409; authentication failures → 401; server errors → 500.
- **Dependencies**: Express, cors, dotenv, Prisma (PostgreSQL likely), bcryptjs, jsonwebtoken, Joi.

## Logic Chain
1. The server imports required modules and enforces a strong `JWT_SECRET` (lines 10‑15).
2. `registerSchema` (lines 82‑86) defines required fields: `email` (valid email), `password` (min 6 chars), optional `name`.
3. `POST /api/auth/register` (lines 87‑101) validates request body against `registerSchema`.
4. If validation fails, responds with **400 Bad Request** and the Joi error message.
5. Checks for existing user via `prisma.user.findUnique` (line 92). If found, returns **409 Conflict** with "User already exists".
6. Hashes password with bcrypt (line 94) and creates a new user via `prisma.user.create` (line 95).
7. Generates JWT token (line 96) with 1‑hour expiry and returns **201 Created** with `{ token }`.
8. Any unexpected exception is caught and results in **500 Internal Server Error** (line 99‑100).
9. Supporting endpoints (`/api/auth`, `/api/auth/refresh`, `/api/preferences`, etc.) illustrate common patterns for auth, token verification, and error handling which should be mirrored for registration‑related routes.

## Caveats
- The `User` Prisma model definition is not present in the repository; assumptions are based on typical fields (`id`, `email`, `passwordHash`, `name`).
- No explicit email verification flow is implemented; registration currently logs in the user immediately.
- Rate‑limiting, CAPTCHA, or other abuse‑prevention mechanisms are absent.
- The `Registration` model used in preferences routes is hinted at but not defined; its schema will affect how registration data is stored.
- No unit or integration tests are observed for the registration endpoint.

## Conclusion
The backend provides a **POST `/api/auth/register`** endpoint that fulfills basic user registration:
- **Payload**: `{ email: string (valid), password: string (≥6 chars), name?: string }`.
- **Validations**: Joi schema, uniqueness check on email.
- **Responses**:
  - `201 Created` – registration successful, returns JWT.
  - `400 Bad Request` – payload validation failure.
  - `409 Conflict` – email already exists.
  - `500 Internal Server Error` – unexpected server error.
- **Dependencies**: Express, Prisma, bcryptjs, jsonwebtoken, Joi, dotenv, cors.
- **Error handling** follows a consistent pattern across the codebase.

## Verification Method
1. Run the server (`npm run dev` or `node dist/index.js`) and issue HTTP requests to the registration endpoint using a tool like `curl` or Postman.
2. Verify that:
   - Invalid payload returns 400 with Joi error.
   - Duplicate email returns 409.
   - Successful registration returns 201 and a JWT that can be decoded with the secret.
3. Inspect the Prisma schema (`prisma/schema.prisma`) to confirm the `User` model fields.
4. Ensure the JWT secret length validation (line 12) is enforced on startup.
5. Review other routes for consistent error handling patterns as a sanity check.
