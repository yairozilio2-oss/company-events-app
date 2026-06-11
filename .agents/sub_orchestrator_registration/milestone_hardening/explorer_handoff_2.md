# Handoff Report – Registration Feature Hardening

## Observation
- The registration endpoint is defined in `backend/src/index.ts` at lines **81‑100**:
  ```ts
  // Register route (POST) – register new user
  const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().optional()
  });
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const { email, password, name } = value;
    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(409).json({ error: 'User already exists' });
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({ data: { email, passwordHash, name } });
      const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '1h' });
      res.status(201).json({ token });
    } catch (e) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  ```
- JWT secret validation occurs earlier (lines **10‑15**) ensuring a minimum length of 32 characters.
- Passwords are hashed with bcrypt using the default cost factor of **10**.
- No email verification step, no rate‑limiting, and generic error messages expose minimal details.
- The route returns a JWT immediately upon successful registration.

## Logic Chain
1. **Input validation** – Joi enforces email format and a minimum password length of 6 characters (Observation). This is weak: industry recommendations are ≥12 characters or use entropy checks.
2. **User existence check** – A single DB query determines if the email already exists (Observation). This reveals existence via HTTP 409, enabling user‑enumeration attacks.
3. **Password hashing** – bcrypt with cost 10 is performed (Observation). While acceptable, higher cost improves resistance to brute‑force on leaked hashes.
4. **Token issuance** – A JWT signed with `jwtSecret` (validated at startup) is returned directly (Observation). No additional claims, no email verification flag, and token life is 1 hour.
5. **Error handling** – All server‑side failures map to `500 Server error` without logging details (Observation). This limits information leakage but also prevents alerting on suspicious activity.
6. **Missing controls** – No rate‑limiting, captcha, or IP‑based throttling (Inference from absence of such code). No account lockout after repeated failures.
7. **Potential attack vectors** derived from steps 1‑6:
   - **Weak password policy** → credential stuffing, offline brute‑force.
   - **User‑enumeration via 409** → targeted phishing.
   - **Immediate token issuance without email verification** → account takeover if registration is abused.
   - **Static bcrypt cost** → may be insufficient if hashes are compromised.
   - **No rate limiting / captcha** → automated registration abuse (spam, resource exhaustion).
   - **Short JWT lifetime without refresh mechanism** may cause frequent re‑authentication, leading to DoS if tokens are repeatedly requested.

## Caveats
- The codebase does not show any middleware for rate‑limiting; it may be applied globally elsewhere (not observed in this file).
- No external email service integration is visible, but could exist in another module (unexplored). We assume registration is the sole entry point for new accounts.
- Logging and monitoring are not present in the shown snippet; their presence elsewhere could mitigate some threats.
- The Prisma schema for `User` is not inspected; constraints such as unique indexes are presumed from the existence check.

## Conclusion
The registration feature currently provides basic functionality but exhibits several adversarial weaknesses:
1. **Password policy is too permissive** – increase minimum length and enforce complexity/entropy.
2. **User‑enumeration** – replace 409 response with a generic success message and perform email verification before revealing existence.
3. **Missing email verification** – require users to confirm their email before activating the account and issuing a JWT.
4. **Static bcrypt cost** – raise the cost (e.g., 12) and make it configurable.
5. **No rate‑limiting / anti‑automation** – introduce middleware (e.g., `express-rate-limit`) and optionally CAPTCHA.
6. **Token issuance** – consider issuing a short‑lived “unverified” token or none until email verification completes.
7. **Logging & monitoring** – add audit logs for registration attempts, failures, and suspicious patterns.

Implementing these hardening strategies will significantly raise the bar for adversarial exploitation of the registration flow.

## Verification Method
- **Static analysis**: Re‑run `grep` for `app.post('/api/auth/register'` and verify that the suggested patches (e.g., updated Joi schema, added rate‑limit middleware) are applied.
- **Unit tests**: Add tests that attempt registration with weak passwords, duplicate emails, and rapid repeated requests; confirm that the system rejects or throttles appropriately.
- **Integration test**: Verify that a newly registered account does not receive a functional JWT until email verification endpoint is called.
- **Performance test**: Benchmark bcrypt hashing at the new cost factor to ensure acceptable response times.
- **Security scan**: Use a OWASP ZAP scan against `/api/auth/register` to confirm that enumeration and rate‑limiting protections are in place.

---
*Report generated by explorer subagent.*
