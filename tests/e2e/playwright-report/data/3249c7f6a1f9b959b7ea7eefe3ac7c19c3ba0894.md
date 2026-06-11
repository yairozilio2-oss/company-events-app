# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1_feature\f4_notifications.spec.ts >> F4: Notifications Tier 1 Tests >> Test 1: Roommate Invitation Notification
- Location: tier1_feature\f4_notifications.spec.ts:16:9

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/register
Call log:
  - navigating to "http://localhost:3000/register", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import fs from 'fs';
  3   | import path from 'path';
  4   | 
  5   | test.describe.serial('F4: Notifications Tier 1 Tests', () => {
  6   | 
  7   |     const logFilePath = 'mock_emails.log';
  8   | 
  9   |     test.beforeAll(() => {
  10  |         // Clear log file if exists to prevent tests from failing due to previous runs
  11  |         if (fs.existsSync(logFilePath)) {
  12  |             fs.writeFileSync(logFilePath, '');
  13  |         }
  14  |     });
  15  | 
  16  |     test('Test 1: Roommate Invitation Notification', async ({ browser }) => {
  17  |         const context = await browser.newContext();
  18  |         const page = await context.newPage();
  19  |         
  20  |         // Register User A
> 21  |         await page.goto('/register');
      |                    ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/register
  22  |         await page.fill('input[name="firstName"]', 'UserA');
  23  |         await page.fill('input[name="lastName"]', 'Test');
  24  |         await page.fill('input[name="email"]', 'usera@example.com');
  25  |         await page.fill('input[name="password"]', 'password123');
  26  |         await page.click('button[type="submit"]');
  27  | 
  28  |         await page.goto('/roommates');
  29  |         await page.fill('input[name="inviteEmail"]', 'userb@example.com');
  30  |         await page.click('button:has-text("Invite")');
  31  | 
  32  |         await page.waitForTimeout(1000);
  33  | 
  34  |         if (!fs.existsSync(logFilePath)) {
  35  |             fs.writeFileSync(logFilePath, '');
  36  |         }
  37  |         const logContent = fs.readFileSync(logFilePath, 'utf8');
  38  |         expect(logContent).toContain('To: userb@example.com');
  39  |         expect(logContent).toContain('roommate invitation');
  40  |         
  41  |         await context.close();
  42  |     });
  43  | 
  44  |     test('Test 2: Roommate Invitation Accepted Notification', async ({ browser }) => {
  45  |         const context = await browser.newContext();
  46  |         const page = await context.newPage();
  47  | 
  48  |         // Register User B
  49  |         await page.goto('/register');
  50  |         await page.fill('input[name="firstName"]', 'UserB');
  51  |         await page.fill('input[name="lastName"]', 'Test');
  52  |         await page.fill('input[name="email"]', 'userb@example.com');
  53  |         await page.fill('input[name="password"]', 'password123');
  54  |         await page.click('button[type="submit"]');
  55  | 
  56  |         await page.goto('/roommates');
  57  |         await page.click('button:has-text("Accept")'); // Assuming the invite from Test 1 is visible
  58  | 
  59  |         await page.waitForTimeout(1000);
  60  | 
  61  |         if (!fs.existsSync(logFilePath)) {
  62  |             fs.writeFileSync(logFilePath, '');
  63  |         }
  64  |         const logContent = fs.readFileSync(logFilePath, 'utf8');
  65  |         expect(logContent).toContain('To: usera@example.com');
  66  |         expect(logContent).toContain('accepted your invitation');
  67  | 
  68  |         await context.close();
  69  |     });
  70  | 
  71  |     test('Test 3: Booking Confirmation Notification', async ({ browser }) => {
  72  |         const context = await browser.newContext();
  73  |         const page = await context.newPage();
  74  | 
  75  |         // Register User C
  76  |         await page.goto('/register');
  77  |         await page.fill('input[name="firstName"]', 'UserC');
  78  |         await page.fill('input[name="lastName"]', 'Test');
  79  |         await page.fill('input[name="email"]', 'userc@example.com');
  80  |         await page.fill('input[name="password"]', 'password123');
  81  |         await page.click('button[type="submit"]');
  82  | 
  83  |         // Book a room
  84  |         await page.goto('/checkout');
  85  |         await page.click('button:has-text("Confirm Booking")');
  86  | 
  87  |         await page.waitForTimeout(1000);
  88  | 
  89  |         if (!fs.existsSync(logFilePath)) {
  90  |             fs.writeFileSync(logFilePath, '');
  91  |         }
  92  |         const logContent = fs.readFileSync(logFilePath, 'utf8');
  93  |         expect(logContent).toContain('userc@example.com');
  94  |         expect(logContent).toContain('Booking Confirmation');
  95  | 
  96  |         await context.close();
  97  |     });
  98  | 
  99  |     test('Test 4: Registration Cancellation Notification', async ({ browser }) => {
  100 |         const context = await browser.newContext();
  101 |         const page = await context.newPage();
  102 | 
  103 |         // Register User D
  104 |         await page.goto('/register');
  105 |         await page.fill('input[name="firstName"]', 'UserD');
  106 |         await page.fill('input[name="lastName"]', 'Test');
  107 |         await page.fill('input[name="email"]', 'userd@example.com');
  108 |         await page.fill('input[name="password"]', 'password123');
  109 |         await page.click('button[type="submit"]');
  110 | 
  111 |         // Book a room
  112 |         await page.goto('/checkout');
  113 |         await page.click('button:has-text("Confirm Booking")');
  114 | 
  115 |         // Cancel booking
  116 |         await page.goto('/my-bookings');
  117 |         await page.click('button:has-text("Cancel Booking")');
  118 |         await page.click('button:has-text("Confirm Cancellation")');
  119 | 
  120 |         await page.waitForTimeout(1000);
  121 | 
```