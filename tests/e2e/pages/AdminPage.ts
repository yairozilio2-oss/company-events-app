import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdminPage extends BasePage {
  readonly eventNameInput: Locator;
  readonly eventStartDate: Locator;
  readonly eventEndDate: Locator;
  readonly registrationDeadline: Locator;
  readonly createEventButton: Locator;
  readonly updateEventButton: Locator;
  readonly successMessage: Locator;
  readonly runAutoAllocationButton: Locator;
  readonly allocationStatus: Locator;
  readonly maleRooms: Locator;
  readonly femaleRooms: Locator;
  readonly mixedRooms: Locator;
  readonly exportCsvButton: Locator;
  readonly sendRemindersButton: Locator;

  constructor(page: Page) {
    super(page);
    this.eventNameInput = page.getByTestId('event-name-input');
    this.eventStartDate = page.getByTestId('event-start-date');
    this.eventEndDate = page.getByTestId('event-end-date');
    this.registrationDeadline = page.getByTestId('registration-deadline');
    this.createEventButton = page.getByTestId('create-event-button');
    this.updateEventButton = page.getByTestId('update-event-button');
    this.successMessage = page.getByTestId('success-message');
    this.runAutoAllocationButton = page.getByTestId('run-auto-allocation-button');
    this.allocationStatus = page.getByTestId('allocation-status');
    this.maleRooms = page.getByTestId('room-gender-male');
    this.femaleRooms = page.getByTestId('room-gender-female');
    this.mixedRooms = page.getByTestId('room-gender-mixed');
    this.exportCsvButton = page.getByTestId('export-csv-button');
    this.sendRemindersButton = page.getByTestId('send-reminders-button');
  }

  async gotoCreateEvent() {
    await this.goto('/admin/events/new');
  }

  async gotoEditEvent(eventId: number) {
    await this.goto(`/admin/events/${eventId}/edit`);
  }

  async gotoAllocation(eventId: number) {
    await this.goto(`/admin/events/${eventId}/allocation`);
  }

  async gotoAllocationReport(eventId: number) {
    await this.goto(`/admin/events/${eventId}/reports/allocation`);
  }

  async gotoOccupancyReport(eventId: number) {
    await this.goto(`/admin/events/${eventId}/reports/occupancy`);
  }

  async gotoReminders(eventId: number) {
    await this.goto(`/admin/events/${eventId}/reminders`);
  }
}
