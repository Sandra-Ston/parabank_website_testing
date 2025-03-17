import { test, expect } from '@playwright/test';

test('Register New Customer', async ({ page }) => {
  // 1. Launch browser and navigate to the URL
  await page.goto('https://parabank.parasoft.com/parabank/index.htm');
  
  // 2. Verify that the home page is visible successfully
  // (Adjust the selector to an element unique to the home page)
  await expect(page.locator('css=selector-for-homepage-identifier')).toBeVisible();
  
  // 3. Click on 'Register' button
  await page.click('text=Register');

  // 4. Verify 'Signing up is easy!' is visible
  await expect(page.locator('text=Signing up is easy!')).toBeVisible();

  // 5. Fill registration details
  await page.fill('input[name="customer.firstName"]', 'John');
  await page.fill('input[name="customer.lastName"]', 'Doe');
  await page.fill('input[name="customer.address.street"]', '123 Main St');
  await page.fill('input[name="customer.address.city"]', 'SampleCity');
  await page.fill('input[name="customer.address.state"]', 'SampleState');
  await page.fill('input[name="customer.address.zipCode"]', '12345');
  await page.fill('input[name="customer.phoneNumber"]', '5551234567');
  await page.fill('input[name="customer.ssn"]', '123-45-6789');
  await page.fill('input[name="customer.username"]', 'johndoe');
  await page.fill('input[name="customer.password"]', 'Password123!');
  await page.fill('input[name="repeatedPassword"]', 'Password123!');

  // 6. Click 'Register' button to submit the form
  await page.click('input[value="Register"]'); // adjust the selector if needed

  // 7. Verify that 'Welcome [user name]' is visible
  await expect(page.locator('text=Welcome johndoe')).toBeVisible();

  // 8. Verify that the success message is visible
  await expect(page.locator('text=Your account was created successfully. You are now logged in.')).toBeVisible();
});