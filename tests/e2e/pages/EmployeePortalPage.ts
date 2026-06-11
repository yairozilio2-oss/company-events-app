import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class EmployeePortalPage extends BasePage {
  readonly dashboardHeader: Locator;
  readonly activeEventsList: Locator;
  readonly eventItems: Locator;
  readonly arrivalPreference: Locator;
  readonly kosherFoodCheckbox: Locator;
  readonly saveRegistrationButton: Locator;
  readonly successMessage: Locator;
  readonly roomStatusLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.dashboardHeader = page.getByTestId('dashboard-header');
    this.activeEventsList = page.getByTestId('active-events-list');
    this.eventItems = page.getByTestId('event-item');
    this.arrivalPreference = page.getByTestId('arrival-preference');
    this.kosherFoodCheckbox = page.getByTestId('kosher-food-checkbox');
    this.saveRegistrationButton = page.getByTestId('save-registration-button');
    this.successMessage = page.getByTestId('success-message');
    this.roomStatusLabel = page.getByTestId('room-status-label');
  }

  async gotoDashboard() {
    await this.goto('/dashboard');
  }

  async gotoRegistration(eventId: number) {
    await this.goto(`/events/${eventId}/register`);
  }

  async gotoRoomStatus(eventId: number) {
    await this.goto(`/events/${eventId}/room-status`);
  }
}
