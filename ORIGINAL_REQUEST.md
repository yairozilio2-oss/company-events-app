# Original User Request

## Initial Request — 2026-06-10T20:00:24+03:00

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

A web application for managing employee registration, accommodation preferences, and room allocation for company seminars and events.

Working directory: c:/Users/yairo/OneDrive/Desktop/new-project
Integrity mode: development

## Requirements

### R1. Employee Portal
A responsive RTL web interface (Hebrew) where employees can log in, view their assigned events, set preferences (arrival, kosher food, roommate request), and see their room status.

### R2. Roommate Selection & Approval
A bidirectional approval system where employees can invite roommates. Rooms are locked only when all invited roommates approve.

### R3. Admin & Manager Portal
A dashboard for managers/admins to create events, set deadlines, run automatic allocation for unassigned users, and view/export occupancy reports.

### R4. Automatic Notifications
The system should send automated notifications (or mock emails) for roommate invitations, booking confirmations, changes/cancellations, and reminders for uncompleted registrations.

## Acceptance Criteria

### Employee Registration
- [ ] Employee can navigate the registration flow and select preferences without errors.

### Roommate Selection
- [ ] An employee can send a roommate request, and the other employee can accept it. 
- [ ] The room status changes to locked upon all acceptances.
- [ ] Gender separation rules are enforced (employees of different genders cannot share a room).

### Admin Capabilities
- [ ] Admin can trigger auto-allocation for employees who selected "don't care".
- [ ] The system assigns them to valid rooms based on gender separation rules.

### Notifications
- [ ] System logs or generates mock emails indicating successful notifications for key events like roommate requests and confirmations.
