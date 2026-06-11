import { test, expect } from '@playwright/test';

test.describe('Tier 2: Boundary & Corner Cases - Feature 1 (Employee Registration & Preferences)', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the registration/preferences page. Assuming local environment and session handled.
    await page.goto('/preferences');
  });

  test('Test 1: Empty mandatory inputs should show validation errors', async ({ page }) => {
    // Attempt to submit without filling any fields
    await page.getByTestId('submit-preferences').click();
    
    // Check for validation error on a mandatory field like arrival confirmation
    const arrivalError = page.getByTestId('error-arrival');
    await expect(arrivalError).toBeVisible();
    await expect(arrivalError).toHaveText(/שדה חובה/); // "Required field" in Hebrew
  });

  test('Test 2: Maximum length inputs in text fields (notes/roommate)', async ({ page }) => {
    // Generate a very long string exceeding typical 255/500 char limits
    const longString = 'א'.repeat(1001); 
    
    await page.getByTestId('input-roommate').fill(longString);
    await page.getByTestId('input-notes').fill(longString);
    
    await page.getByTestId('submit-preferences').click();
    
    // Check if the system correctly rejects or truncates (assuming it rejects with an error here)
    const lengthError = page.getByTestId('error-max-length');
    await expect(lengthError).toBeVisible();
  });

  test('Test 3: Invalid preference combinations (not arriving but requesting roommate/food)', async ({ page }) => {
    // Select 'Not Arriving'
    await page.getByTestId('arrival-not-attending').click();
    
    // Try to request a roommate or select kosher food despite not attending
    await page.getByTestId('input-roommate').fill('ישראל ישראלי');
    await page.getByTestId('submit-preferences').click();
    
    // Expect a conflict/validation error 
    const conflictError = page.getByTestId('error-conflict');
    await expect(conflictError).toBeVisible();
  });

  test('Test 4: XSS attempts in notes fields should be sanitized', async ({ page }) => {
    // Enter an XSS payload
    const xssPayload = '<script>alert("XSS")</script><img src=x onerror=alert(1)>';
    
    // Assuming we need to select attending to submit notes
    await page.getByTestId('arrival-attending').click();
    await page.getByTestId('input-notes').fill(xssPayload);
    
    await page.getByTestId('submit-preferences').click();
    
    // Navigate to a page where notes are displayed (or check success state)
    await page.goto('/summary');
    
    // Verify script is not injected as HTML
    const savedNotes = page.getByTestId('display-notes');
    await expect(savedNotes).toHaveText(xssPayload); // Text should be escaped, matching literal input
  });

  test('Test 5: Navigating forward/back without saving should clear unsaved state', async ({ page }) => {
    // Fill out some preferences
    await page.getByTestId('arrival-attending').click();
    await page.getByTestId('input-notes').fill('טקסט ניסיון'); // "Test text"
    
    // Navigate away without saving
    await page.goto('/dashboard');
    
    // Navigate back
    await page.goBack();
    
    // Verify the state is lost/reset
    const notesInput = page.getByTestId('input-notes');
    await expect(notesInput).toBeEmpty();
  });

});
