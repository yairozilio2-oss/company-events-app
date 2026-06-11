import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class RoommatePage extends BasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly roommateStatus: Locator;
  readonly roomLockStatus: Locator;
  readonly errorMessage: Locator;
  readonly cancelRoomBookingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByTestId('roommate-search-input');
    this.searchButton = page.getByTestId('search-button');
    this.roommateStatus = page.getByTestId('roommate-status');
    this.roomLockStatus = page.getByTestId('room-lock-status');
    this.errorMessage = page.getByTestId('error-message');
    this.cancelRoomBookingButton = page.getByTestId('cancel-room-booking-button');
  }

  async gotoRoommateSelection(eventId: number) {
    await this.goto(`/events/${eventId}/roommate`);
  }

  async gotoRoommateRequests(eventId: number) {
    await this.goto(`/events/${eventId}/roommate-requests`);
  }

  getSendRequestButton(employeeId: string): Locator {
    return this.page.getByTestId(`send-request-button-${employeeId}`);
  }

  getRequestStatus(employeeId: string): Locator {
    return this.page.getByTestId(`request-status-${employeeId}`);
  }

  getAcceptRequestButton(employeeId: string): Locator {
    return this.page.getByTestId(`accept-request-${employeeId}`);
  }

  getRejectRequestButton(employeeId: string): Locator {
    return this.page.getByTestId(`reject-request-${employeeId}`);
  }

  getRejectedMessage(employeeId: string): Locator {
    return this.page.getByTestId(`rejected-message-${employeeId}`);
  }

  getCancelRequestButton(employeeId: string): Locator {
    return this.page.getByTestId(`cancel-request-${employeeId}`);
  }
}
