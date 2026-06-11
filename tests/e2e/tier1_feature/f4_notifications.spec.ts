import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe.serial('F4: Notifications Tier 1 Tests', () => {

    const logFilePath = 'mock_emails.log';

    test.beforeAll(() => {
        // Clear log file if exists to prevent tests from failing due to previous runs
        if (fs.existsSync(logFilePath)) {
            fs.writeFileSync(logFilePath, '');
        }
    });

    test('Test 1: Roommate Invitation Notification', async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        
        // Register User A
        await page.goto('/register');
        await page.fill('input[name="firstName"]', 'UserA');
        await page.fill('input[name="lastName"]', 'Test');
        await page.fill('input[name="email"]', 'usera@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        await page.goto('/roommates');
        await page.fill('input[name="inviteEmail"]', 'userb@example.com');
        await page.click('button:has-text("Invite")');

        await page.waitForTimeout(1000);

        if (!fs.existsSync(logFilePath)) {
            fs.writeFileSync(logFilePath, '');
        }
        const logContent = fs.readFileSync(logFilePath, 'utf8');
        expect(logContent).toContain('To: userb@example.com');
        expect(logContent).toContain('roommate invitation');
        
        await context.close();
    });

    test('Test 2: Roommate Invitation Accepted Notification', async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        // Register User B
        await page.goto('/register');
        await page.fill('input[name="firstName"]', 'UserB');
        await page.fill('input[name="lastName"]', 'Test');
        await page.fill('input[name="email"]', 'userb@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        await page.goto('/roommates');
        await page.click('button:has-text("Accept")'); // Assuming the invite from Test 1 is visible

        await page.waitForTimeout(1000);

        if (!fs.existsSync(logFilePath)) {
            fs.writeFileSync(logFilePath, '');
        }
        const logContent = fs.readFileSync(logFilePath, 'utf8');
        expect(logContent).toContain('To: usera@example.com');
        expect(logContent).toContain('accepted your invitation');

        await context.close();
    });

    test('Test 3: Booking Confirmation Notification', async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        // Register User C
        await page.goto('/register');
        await page.fill('input[name="firstName"]', 'UserC');
        await page.fill('input[name="lastName"]', 'Test');
        await page.fill('input[name="email"]', 'userc@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Book a room
        await page.goto('/checkout');
        await page.click('button:has-text("Confirm Booking")');

        await page.waitForTimeout(1000);

        if (!fs.existsSync(logFilePath)) {
            fs.writeFileSync(logFilePath, '');
        }
        const logContent = fs.readFileSync(logFilePath, 'utf8');
        expect(logContent).toContain('userc@example.com');
        expect(logContent).toContain('Booking Confirmation');

        await context.close();
    });

    test('Test 4: Registration Cancellation Notification', async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        // Register User D
        await page.goto('/register');
        await page.fill('input[name="firstName"]', 'UserD');
        await page.fill('input[name="lastName"]', 'Test');
        await page.fill('input[name="email"]', 'userd@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Book a room
        await page.goto('/checkout');
        await page.click('button:has-text("Confirm Booking")');

        // Cancel booking
        await page.goto('/my-bookings');
        await page.click('button:has-text("Cancel Booking")');
        await page.click('button:has-text("Confirm Cancellation")');

        await page.waitForTimeout(1000);

        if (!fs.existsSync(logFilePath)) {
            fs.writeFileSync(logFilePath, '');
        }
        const logContent = fs.readFileSync(logFilePath, 'utf8');
        expect(logContent).toContain('userd@example.com');
        expect(logContent).toContain('Booking Cancelled');

        await context.close();
    });

    test('Test 5: Reminder for Uncompleted Registration', async ({ browser }) => {
        const userEContext = await browser.newContext();
        const pageE = await userEContext.newPage();

        // User E starts registration but doesn't complete
        await pageE.goto('/register');
        await pageE.fill('input[name="firstName"]', 'UserE');
        await pageE.fill('input[name="lastName"]', 'Test');
        await pageE.fill('input[name="email"]', 'usere@example.com');
        await pageE.fill('input[name="password"]', 'password123');
        // Do not click submit or complete checkout
        await userEContext.close();

        // Admin logs in and sends reminder
        const adminContext = await browser.newContext();
        const adminPage = await adminContext.newPage();
        await adminPage.goto('/login');
        await adminPage.fill('input[name="email"]', 'admin@example.com');
        await adminPage.fill('input[name="password"]', 'adminpassword');
        await adminPage.click('button[type="submit"]');

        await adminPage.goto('/admin/pending-registrations');
        // Locate User E and click "Send Reminder"
        await adminPage.locator(`tr:has-text("usere@example.com")`).locator('button:has-text("Send Reminder")').click();

        await adminPage.waitForTimeout(1000);

        if (!fs.existsSync(logFilePath)) {
            fs.writeFileSync(logFilePath, '');
        }
        const logContent = fs.readFileSync(logFilePath, 'utf8');
        expect(logContent).toContain('usere@example.com');
        expect(logContent).toContain('Complete your registration');

        await adminContext.close();
    });
});
