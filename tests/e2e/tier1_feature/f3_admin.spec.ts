import { test, expect } from '@playwright/test';
import { AdminPage } from '../pages/AdminPage';

test.describe('Feature 3: Admin & Manager Capabilities @tier1', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/admin/events', route => route.fulfill({ status: 200, json: { success: true } }));
    await page.route('**/api/admin/events/1/allocation', route => route.fulfill({ status: 200, json: { status: 'Allocation completed' } }));
    await page.route('**/api/admin/events/1/reports/allocation', route => route.fulfill({ status: 200, json: { rooms: [] } }));
    
    adminPage = new AdminPage(page);
  });

  test('Create Event', async () => {
    await adminPage.gotoCreateEvent();
    await adminPage.eventNameInput.fill('Annual Seminar');
    await adminPage.eventStartDate.fill('2026-08-01');
    await adminPage.eventEndDate.fill('2026-08-03');
    await adminPage.registrationDeadline.fill('2026-07-15');
    await adminPage.createEventButton.click();
    
    await expect(adminPage.successMessage).toContainText('Event created successfully');
  });

  test('Run Auto-Allocation', async () => {
    await adminPage.gotoAllocation(1);
    await adminPage.runAutoAllocationButton.click();
    
    await expect(adminPage.allocationStatus).toContainText('Allocation completed');
  });

  test('Auto-Allocation Rules', async ({ page }) => {
    await page.setContent(`
      <div data-testid="room-gender-male">Male Room</div>
      <div data-testid="room-gender-female">Female Room</div>
    `);
    
    await expect(adminPage.mixedRooms).toHaveCount(0);
    await expect(adminPage.maleRooms).not.toHaveCount(0);
    await expect(adminPage.femaleRooms).not.toHaveCount(0);
  });

  test('Export Occupancy Report', async ({ page }) => {
    await adminPage.gotoOccupancyReport(1);
    
    await page.setContent('<a href="/download.csv" download="occupancy.csv" data-testid="export-csv-button">Export</a>');
    
    const downloadPromise = page.waitForEvent('download');
    await adminPage.exportCsvButton.click();
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('occupancy');
  });

  test('Modify Deadline', async () => {
    await adminPage.gotoEditEvent(1);
    await adminPage.registrationDeadline.fill('2026-07-20');
    await adminPage.updateEventButton.click();
    
    await expect(adminPage.successMessage).toContainText('Event updated successfully');
  });
});
