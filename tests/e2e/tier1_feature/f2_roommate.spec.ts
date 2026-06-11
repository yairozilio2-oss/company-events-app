import { test, expect } from '@playwright/test';
import { RoommatePage } from '../pages/RoommatePage';
import { EmployeePortalPage } from '../pages/EmployeePortalPage';

test.describe('Feature 2: Roommate Selection & Approval @tier1', () => {
  let roommatePage: RoommatePage;
  let employeePortal: EmployeePortalPage;

  test.beforeEach(async ({ page }) => {
    // Mock the APIs
    await page.route('**/api/roommates/search', route => route.fulfill({
      status: 200,
      json: [{ id: 'emp-b', name: 'Employee B', gender: 'male' }]
    }));
    await page.route('**/api/roommates/request', route => route.fulfill({ status: 200, json: { status: 'Pending' } }));
    await page.route('**/api/roommates/accept', route => route.fulfill({ status: 200, json: { status: 'Confirmed' } }));
    await page.route('**/api/roommates/reject', route => route.fulfill({ status: 200, json: { status: 'Rejected' } }));
    await page.route('**/api/roommates/cancel', route => route.fulfill({ status: 200, json: { status: 'Cancelled' } }));
    await page.route('**/api/events/1/room-status', route => route.fulfill({ status: 200, json: { roomLocked: true } }));
    
    roommatePage = new RoommatePage(page);
    employeePortal = new EmployeePortalPage(page);
  });

  test('Send Roommate Request', async () => {
    await roommatePage.gotoRoommateSelection(1);
    await roommatePage.searchInput.fill('Employee B');
    await roommatePage.searchButton.click();
    await roommatePage.getSendRequestButton('emp-b').click();
    
    await expect(roommatePage.getRequestStatus('emp-b')).toContainText('Pending');
  });

  test('Accept Request', async () => {
    await roommatePage.gotoRoommateRequests(1);
    await roommatePage.getAcceptRequestButton('emp-a').click();
    
    await expect(roommatePage.roommateStatus).toContainText('Confirmed');
  });

  test('Reject Request', async () => {
    await roommatePage.gotoRoommateRequests(1);
    await roommatePage.getRejectRequestButton('emp-c').click();
    
    await expect(roommatePage.getRejectedMessage('emp-c')).toBeVisible();
  });

  test('Room Locking', async ({ page }) => {
    await roommatePage.gotoRoommateRequests(1);
    await page.getByTestId('accept-request-emp-c').click();
    
    const roomStatus = page.getByRole('status', { name: 'room-status' });
    await expect(roomStatus).toContainText('Locked');
  });

  test('Gender Separation', async ({ page }) => {
    await page.route('**/api/roommates/request', route => route.fulfill({
      status: 400,
      json: { error: 'Cannot share room with opposite gender' }
    }));
    
    await roommatePage.gotoRoommateSelection(1);
    await roommatePage.searchInput.fill('Employee D');
    await roommatePage.searchButton.click();
    await roommatePage.getSendRequestButton('emp-d').click();
    
    await expect(roommatePage.errorMessage).toContainText('Cannot share room with opposite gender');
  });
});
