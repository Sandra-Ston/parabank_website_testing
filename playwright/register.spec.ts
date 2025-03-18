import { test, expect } from '@playwright/test';

test.describe("Customer Register and Login", () => {

    test.beforeEach(async ({ page }) => {
        await page.goto("https://parabank.parasoft.com/parabank/index.htm");
        await expect(page.locator("body")).toBeVisible();
        await expect(page).toHaveURL(/parabank\.parasoft\.com\/parabank\/index\.htm/);
    });


    test.describe("Test Case 1: New Customer Registration", () => {
        test("should allow a new user to register successfully", async ({ page }) => {

            const registerLink = page.locator("text=Register");
            await expect(registerLink).toBeVisible();
            await registerLink.click();

            await expect(page.locator("text=Signing up is easy!")).toBeVisible();

            await page.fill("input[name='customer.firstName']", "Alice");
            await page.fill("input[name='customer.lastName']", "Right");
            await page.fill("input[name='customer.address.street']", "123 Test Street");
            await page.fill("input[name='customer.address.city']", "Red Deer");
            await page.fill("input[name='customer.address.state']", "Alberta");
            await page.fill("input[name='customer.address.zipCode']", "T4E 0B2");
            await page.fill("input[name='customer.phoneNumber']", "+1234567890");
            await page.fill("input[name='customer.ssn']", "123456789");
            await page.fill("input[name='customer.username']", "AliceTestUser");
            await page.fill("input[name='customer.password']", "TestPassword123");
            await page.fill("input[name='repeatedPassword']", "TestPassword123");

            await page.click("input[value='Register']");

            await expect(page.locator("text=Welcome AliceTestUser")).toBeVisible();
        });
    });

    test.describe("Test Case 2: Customer Login with Valid Credentials", () => {
        test("should login with valid credentials", async ({ page }) => {

            await page.fill("input[name='username']", "AliceTestUser");
            await page.fill("input[name='password']", "TestPassword123");

            await page.click("input[value='Log In']");

            await expect(page.locator(`text=Welcome Alice Right`)).toBeVisible();
        });

    });

    test.describe("Test Case 3: Customer Login with Invalid Credentials", () => {
        test("should display error for invalid credentials", async ({ page }) => {

            await page.fill("input[name='username']", "Rose");
            await page.fill("input[name='password']", "Wrong");

            await page.click("input[value='Log In']");

            await expect(page.locator("text=Error!")).toBeVisible();
            await expect(
                page.locator("text=The username and password could not be verified.")
            ).toBeVisible();
        });
    });

    test.describe("Test Case 4: Login Customer Just With Username", () => {
        test("should prompt for missing password when only username is entered", async ({ page }) => {

            await page.fill("input[name='username']", "AliceTestUser");

            await page.click("input[value='Log In']");

            await expect(page.locator("text=Please enter a username and password.")).toBeVisible();
        });
    });

    test.describe("Test Case 5: Password Recovery", () => {
        test("should allow users to recover their password", async ({ page }) => {

            const forgotLoginLink = page.locator("text=Forgot login info?");
            await expect(forgotLoginLink).toBeVisible();
            await forgotLoginLink.click();

            await page.fill("input[name='firstName']", "Alice");
            await page.fill("input[name='lastName']", "Right");
            await page.fill("input[name='address.street']", "123 Test Street");
            await page.fill("input[name='address.city']", "Red Deer");
            await page.fill("input[name='address.state']", "Alberta");
            await page.fill("input[name='address.zipCode']", "T4E 0B2");
            await page.fill("input[name='ssn']", "123456789");

            await page.click("input[value='Find My Login Info']");

            await expect(page.locator("text=Your login information was located successfully. You are now logged in.")).toBeVisible();
        });
    });

    test.describe("Test Case 6: Password Recovery with Invalid Credentials", () => {
        test("should display error for invalid credentials", async ({ page }) => {

            const forgotLoginLink = page.locator("text=Forgot login info?");
            await expect(forgotLoginLink).toBeVisible();
            await forgotLoginLink.click();

            await page.fill("input[name='firstName']", "Rose");
            await page.fill("input[name='lastName']", "Wrong");
            await page.fill("input[name='address.street']", "Fake Street");
            await page.fill("input[name='address.city']", "Nowhere");
            await page.fill("input[name='address.state']", "Unknown");
            await page.fill("input[name='address.zipCode']", "00000");
            await page.fill("input[name='ssn']", "999999999");

            await page.click("input[value='Find My Login Info']");

            await expect(page.locator("text=The customer information provided could not be found.")).toBeVisible();
        });
    });

    test.describe("Test Case 7: Password Recovery with Empty Credentials", () => {
        test("should display error for empty credentials", async ({ page }) => {

            const forgotLoginLink = page.locator("text=Forgot login info?");
            await expect(forgotLoginLink).toBeVisible();
            await forgotLoginLink.click();

            await page.click("input[value='Find My Login Info']");

            const requiredFields = [
                "First name is required.",
                "Last name is required.",
                "Address is required.",
                "City is required.",
                "State is required.",
                "Zip Code is required.",
                "Social Security Number is required",
            ];

            for (const error of requiredFields) {
                await expect(page.locator(`text=${error}`)).toBeVisible();
            }
        });
    });
});

test.describe("Customer Account Tests", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("https://parabank.parasoft.com/parabank/index.htm");
        await expect(page.locator("body")).toBeVisible();
        await expect(page).toHaveURL(/parabank\.parasoft\.com\/parabank\/index\.htm/);

        await page.fill("input[name='username']", "AliceTestUser");
        await page.fill("input[name='password']", "TestPassword123");
        await page.click("input[value='Log In']");
        await expect(page.locator("text=Welcome Alice Right")).toBeVisible();
    });

    test.describe("Test Cases 8-9: Open New Account", () => {
        test("should open a new checking account successfully", async ({ page }) => {

            await page.locator("text=Open New Account").click();
            await expect(page).toHaveURL(/openaccount\.htm/);

            await page.selectOption("#type", "CHECKING");
            await page.selectOption("#fromAccountId", { index: 0 });

            await page.click('input[type="button"].button[value="Open New Account"]');

            await expect(page.locator("text=Account Opened!")).toBeVisible();
            await expect(page.locator("text=Congratulations, your account is now open.")).toBeVisible();

            await expect(page.locator("#newAccountId")).toBeVisible();
            await page.locator("#newAccountId").click();

            await expect(page.locator("text=Account Details")).toBeVisible();
            await expect(page.locator("text=Account Activity")).toBeVisible();

            await page.locator("text=Funds Transfer Received").click();
            await expect(page).toHaveURL(/transaction\.htm/);
            await expect(page.locator("text=Transaction Details")).toBeVisible();
        });

        test("should open a new savings account successfully", async ({ page }) => {

            await page.locator("text=Open New Account").click();
            await expect(page).toHaveURL(/openaccount\.htm/);

            await page.selectOption("#type", "SAVINGS");
            await page.selectOption("#fromAccountId", { index: 0 });

            await page.click('input[type="button"].button[value="Open New Account"]');

            await expect(page.locator("text=Account Opened!")).toBeVisible();
            await expect(page.locator("text=Congratulations, your account is now open.")).toBeVisible();

            await expect(page.locator("#newAccountId")).toBeVisible();
            await page.locator("#newAccountId").click();

            await expect(page.locator("text=Account Details")).toBeVisible();
            await expect(page.locator("text=Account Activity")).toBeVisible();

            await page.locator("text=Funds Transfer Received").click();
            await expect(page).toHaveURL(/transaction\.htm/);
            await expect(page.locator("text=Transaction Details")).toBeVisible();
        });
    });
    test.describe("Test Case 10: Account Overview", () => {
        test("should verify account details and transactions load correctly", async ({ page }) => {

            await page.getByRole('link', { name: 'Accounts Overview' }).click();
            await page.waitForTimeout(2000);
            await expect(page).toHaveURL(/overview\.htm/);

            await expect(page.locator("#accountTable")).toBeVisible();

            await expect(page.locator("#accountTable > thead > tr > th:nth-child(1)")).toHaveText(/Account/);
            await expect(page.locator("#accountTable > thead > tr > th:nth-child(2)")).toHaveText(/Balance/);
            await expect(page.locator("#accountTable > thead > tr > th:nth-child(3)")).toHaveText(/Available Amount/);

            await page.locator("#accountTable > tbody > tr:nth-child(1) > td:nth-child(1) > a").click();

            await expect(page.locator("text=Account Details")).toBeVisible();
            await expect(page.locator("text=Account Activity")).toBeVisible();

            await page.getByRole('link', { name: 'Funds Transfer Sent' }).first().click();
            await expect(page).toHaveURL(/transaction\.htm/);
            await expect(page.locator("text=Transaction Details")).toBeVisible();
        });
    });

    test.describe("Test Case 11: Validate Successful Fund Transfers", () => {
        test("should successfully transfer funds between accounts", async ({ page }) => {

            await page.locator("text=Transfer Funds").click();
            await expect(page).toHaveURL(/transfer\.htm/);
            await expect(page.getByRole('heading', { name: 'Transfer Funds' })).toBeVisible();

            const transferAmount = '100';
            await page.fill("#amount", transferAmount);

            const fromAccountOption = page.locator("#fromAccountId option").first();
            const fromAccount = await fromAccountOption.getAttribute("value");
            await page.selectOption("#fromAccountId", fromAccount);

            const toAccountOption = page.locator("#toAccountId option").last();
            const toAccount = await toAccountOption.getAttribute("value");
            await page.selectOption("#toAccountId", toAccount);

            await page.click('input[value="Transfer"]');

            await expect(page.locator("text=Transfer Complete!")).toBeVisible();

            const transferRegex = new RegExp(`\\$${transferAmount}\\.00 has been transferred from account #${fromAccount} to account #${toAccount}`, 'i');
            await expect(page.getByText(transferRegex)).toBeVisible({ timeout: 1000 });

            await page.getByRole('link', { name: 'Accounts Overview' }).click();
            await page.waitForTimeout(2000);
            await expect(page).toHaveURL(/overview\.htm/);
            await expect(page.getByRole('heading', { name: 'Accounts Overview' })).toBeVisible();

            await expect(page.locator("#accountTable")).toBeVisible();
            const rowCount = await page.locator("#accountTable tbody tr").count();
            expect(rowCount).toBeGreaterThan(1);
        });
    });
});

test.describe("Bill Payment Tests", () => {

    test.beforeEach(async ({ page }) => {
        await page.goto("https://parabank.parasoft.com/parabank/index.htm");

        await page.fill("input[name='username']", "AliceTestUser");
        await page.fill("input[name='password']", "TestPassword123");
        await page.click("input[value='Log In']");
        await expect(page.locator("text=Welcome Alice Right")).toBeVisible();
    });

    test("Test Case 12: Validate Successful Bill Payment", async ({ page }) => {
        await page.getByRole('link', { name: 'Bill Pay' }).click();
        await expect(page).toHaveURL(/billpay\.htm/);
        await expect(page.locator("text=Bill Payment Service")).toBeVisible();

        const payee = {
            name: "Rose Wrong",
            address: "456 Main St",
            city: "Calgary",
            state: "Alberta",
            zipCode: "T2P 2G7",
            phone: "9876543210",
            accountNumber: "123456789",
            amount: "50"
        };

        await page.fill("input[name='payee.name']", payee.name);
        await page.fill("input[name='payee.address.street']", payee.address);
        await page.fill("input[name='payee.address.city']", payee.city);
        await page.fill("input[name='payee.address.state']", payee.state);
        await page.fill("input[name='payee.address.zipCode']", payee.zipCode);
        await page.fill("input[name='payee.phoneNumber']", payee.phone);
        await page.fill("input[name='payee.accountNumber']", payee.accountNumber);
        await page.fill("input[name='verifyAccount']", payee.accountNumber);
        await page.fill("input[name='amount']", payee.amount);

        await page.click("input[value='Send Payment']");

        const paymentRegex = new RegExp(`Bill Payment to ${payee.name} in the amount of \\$?${payee.amount}(.00)? from account \\d+ was successful.`, "i");
        await expect(page.locator("text=Bill Payment Complete")).toBeVisible();
        await expect(page.getByText(paymentRegex)).toBeVisible();

        await page.getByRole('link', { name: 'Accounts Overview' }).click();
        await page.waitForTimeout(2000);
        await expect(page).toHaveURL(/overview\.htm/);
        await expect(page.getByRole('heading', { name: 'Accounts Overview' })).toBeVisible();

        const rowCount = await page.locator("#accountTable tbody tr").count();
        expect(rowCount).toBeGreaterThan(1);
    });

    test.describe("Test Case 13: Validate Unsuccessful Bill Payment", () => {
        test("should display an error for a negative bill payment amount", async ({ page }) => {

          await page.getByRole("link", { name: "Bill Pay" }).click();
          await expect(page).toHaveURL(/billpay\.htm/);
          await expect(page.getByText("Bill Payment Service")).toBeVisible();

          await page.fill("input[name='payee.name']", "Invalid Payee");
          await page.fill("input[name='payee.address.street']", "123 Fake St");
          await page.fill("input[name='payee.address.city']", "Nowhere");
          await page.fill("input[name='payee.address.state']", "ZZ");
          await page.fill("input[name='payee.address.zipCode']", "00000");
          await page.fill("input[name='payee.phoneNumber']", "1234567890");
          await page.fill("input[name='payee.accountNumber']", "999999");
          await page.fill("input[name='verifyAccount']", "999999");
          await page.fill("input[name='amount']", "-500");

          await page.getByRole("button", { name: "Send Payment" }).click();

          await expect(page.getByText("Please enter a valid amount")).toBeVisible();
        });
      });

      test.describe("Test Case 14: Validate Empty Bill Payment", () => {
        test("should display required field warnings when bill payment form is empty", async ({ page }) => {

          await page.getByRole("link", { name: "Bill Pay" }).click();
          await expect(page).toHaveURL(/billpay\.htm/);
          await expect(page.getByText("Bill Payment Service")).toBeVisible();

          await page.locator("input[value='Send Payment']").click();

          await expect(page.getByText("Payee name is required.")).toBeVisible();
          await expect(page.getByText("Address is required.")).toBeVisible();
          await expect(page.getByText("City is required.")).toBeVisible();
          await expect(page.getByText("State is required.")).toBeVisible();
          await expect(page.getByText("Zip Code is required.")).toBeVisible();
          await expect(page.getByText("Phone number is required.")).toBeVisible();
          await expect(page.getByText("The amount cannot be empty")).toBeVisible();
        });
      });
});

test.describe("Find Transactions Tests", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("https://parabank.parasoft.com/parabank/index.htm");

        await page.fill("input[name='username']", "AliceTestUser");
        await page.fill("input[name='password']", "TestPassword123");
        await page.click("input[value='Log In']");
        await expect(page.locator("text=Welcome Alice Right")).toBeVisible();

        await page.getByRole("link", { name: "Find Transactions" }).click();
        await expect(page).toHaveURL(/findtrans\.htm/);

        await page.getByRole("link", { name: "Find Transactions" }).click();
        await expect(page.locator("#transactionForm")).toBeVisible();
    });
  
    test("Test Case 15: Verify Search Results Match The Entered Criteria - ID", async ({ page }) => {

      await page.getByRole("link", { name: "Accounts Overview" }).click();

      const firstTransaction = page.locator("table tbody tr td a").first();
      await firstTransaction.click();

      const fundsTransferLink = page.getByText("Funds Transfer Sent").first();
      await fundsTransferLink.click();

      const url = page.url();
      const transactionId = url.split("id=")[1];

      await page.getByRole("link", { name: "Find Transactions" }).click();
      await expect(page.locator("#transactionForm")).toBeVisible();

      await page.locator("#transactionId").fill(transactionId);
      await page.locator("#findById").click();

      await expect(page.getByText(transactionId)).toBeVisible();
    });

    test.describe("Test Case 16: Validate Incorrect Search For Transaction By ID", () => {
        test("should display an error when an invalid transaction ID is entered", async ({ page }) => {

          await page.locator("#transactionId").fill("qwerty");
          await page.locator("#findById").click();
      
          await expect(page.locator("#transactionIdError")).toContainText("Invalid transaction ID");
        });
      });

      test.describe("Test Case 17: Validate Empty Search For Transaction By ID", () => {
        test("should display a required field warning when no transaction ID is entered", async ({ page }) => {

          await page.locator("#findById").click();
          await expect(page.locator("#transactionIdError")).toContainText("Invalid transaction ID");
        });
      });

      test.describe("Test Case 18: Verify Search Results Match The Entered Criteria - Date", () => {
        test("should search for transactions using a valid date and display matching results", async ({ page }) => {

          const today = new Date();
          const formattedDate = `${(today.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}-${today.getFullYear()}`;

          await page.locator("#transactionDate").fill(formattedDate);
          await page.locator("#findByDate").click();
      
          await expect(page.locator("#transactionTable")).toBeVisible();
          await expect(page.locator("#transactionTable")).toContainText(formattedDate);
          await expect(page.locator("#transactionTable")).toContainText("Funds Transfer Received");
        });
      });
  });

