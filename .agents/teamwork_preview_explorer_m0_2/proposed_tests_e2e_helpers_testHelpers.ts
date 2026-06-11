import { Page } from '@playwright/test';

export async function loginHelper(page: Page, username?: string, password?: string) {
  const user = username || process.env.TEST_USER || 'testuser';
  const pass = password || process.env.TEST_PASS || 'password123';
  
  await page.goto('/login');
  await page.getByTestId('username-input').fill(user);
  await page.getByTestId('password-input').fill(pass);
  await page.getByTestId('login-submit').click();
  
  // Wait for login to complete by looking for a dashboard element or successful redirect
  await page.waitForURL('**/dashboard');
}

export async function mockNotificationReader(notificationId: string) {
  // Skeleton logic to read mocked notifications (e.g. from local file or mock API)
  return {
    id: notificationId,
    subject: 'Mock Email',
    body: 'This is a mock notification body.',
    read: false
  };
}
