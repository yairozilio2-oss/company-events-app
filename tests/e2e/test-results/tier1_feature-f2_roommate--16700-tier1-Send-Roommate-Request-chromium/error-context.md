# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1_feature\f2_roommate.spec.ts >> Feature 2: Roommate Selection & Approval @tier1 >> Send Roommate Request
- Location: tier1_feature\f2_roommate.spec.ts:25:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/events/1/roommate
Call log:
  - navigating to "http://localhost:3000/events/1/roommate", waiting until "load"

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
     |                     ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/events/1/roommate
  12 |   }
  13 | }
  14 | 
```