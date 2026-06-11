# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1_feature\f3_admin.spec.ts >> Feature 3: Admin & Manager Capabilities @tier1 >> Create Event
- Location: tier1_feature\f3_admin.spec.ts:15:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/admin/events/new
Call log:
  - navigating to "http://localhost:3000/admin/events/new", waiting until "load"

```

# Test source

```ts
  1  | import { Page } from '@playwright/test';
  2  | 
  3  | export class BasePage {
  4  |   readonly page: Page;
  5  | 
  6  |   constructor(page: Page) {
  7  |     this.page = page;
  8  |   }
  9  | 
  10 |   async goto(path: string) {
> 11 |     await this.page.goto(path);
     |                     ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/admin/events/new
  12 |   }
  13 | }
  14 | 
```