describe("Customer Register and Login", () => {
  beforeEach( () => {
    cy.visitHomePage();
    cy.fixture("user").as("userData");
  });

  describe("Test Case 1: Customer Registration", () => {
    it("should allow a new user to register successfully", function () {
      cy.registerUser(this.userData.validUser);
      cy.contains(
        "Your account was created successfully. You are now logged in."
      ).should("be.visible");
    });
  });

  describe("Test Cases 2-4: Customer Login", () => {
    it("should login with valid credentials", function () {
      cy.login(
        this.userData.validUser.username,
        this.userData.validUser.password
      );
      cy.contains(
        `Welcome ${this.userData.validUser.firstName} ${this.userData.validUser.lastName}`
      ).should("be.visible");
    });

    it("should display error for invalid credentials", function () {
      cy.login(
        this.userData.invalidUser.username,
        this.userData.invalidUser.password
      );
      cy.contains("Error!").should("be.visible");
      cy.contains("The username and password could not be verified.").should(
        "be.visible"
      );
    });

    it("should prompt for missing password when only username is entered", function () {
      cy.get("input[name='username']").type(this.userData.validUser.username);
      cy.get("input[value='Log In']").click();
      cy.contains("Please enter a username and password.").should("be.visible");
    });
  });

  describe("Test Cases 5-7: Password Recovery", () => {
    it("should allow users to recover their password", function () {
      cy.recoverPassword(this.userData.validUser);
      cy.contains(
        "Your login information was located successfully. You are now logged in."
      ).should("be.visible");
    });

    it("should display error for invalid credentials", function () {
      const invalidUser = {
        firstName: "Rose",
        lastName: "Wrong",
        address: {
          street: "Fake Street",
          city: "Nowhere",
          state: "Unknown",
          zipCode: "00000",
        },
        ssn: "999999999",
      };
      cy.recoverPassword(invalidUser);
      cy.contains(
        "The customer information provided could not be found."
      ).should("be.visible");
    });

    it("should display error for empty credentials", function () {
      cy.contains("Forgot login info?").should("be.visible").click();
      cy.get("input[value='Find My Login Info']").click();
      const requiredFields = [
        "First name is required.",
        "Last name is required.",
        "Address is required.",
        "City is required.",
        "State is required.",
        "Zip Code is required.",
        "Social Security Number is required",
      ];
      requiredFields.forEach((error) => {
        cy.contains(error).should("be.visible");
      });
    });
  });
});

describe("Customer Account Tests", () => {
  beforeEach(() => {
    cy.fixture("user").then((data) => {
        const user = data.validUser;
        cy.restoreSession(user.username, user.password);

        cy.visitHomePage();
        cy.contains(`Welcome ${user.firstName} ${user.lastName}`, { timeout: 10000 }).should("be.visible");
    });
  });

  describe("Test Cases 8-9: Open New Account", () => {
    it("should open a new checking account successfully", () => {
      cy.contains("Open New Account").click();
      cy.url().should("include", "openaccount.htm");

      cy.get("#type").select("CHECKING");
      cy.get("#fromAccountId").select(0);
      cy.get('input[type="button"].button[value="Open New Account"]').click();

      cy.contains("Account Opened!").should("be.visible");
      cy.contains("Congratulations, your account is now open.").should(
        "be.visible"
      );
      cy.get("#newAccountId").should("be.visible").click();

      cy.contains("Account Details").should("be.visible");
      cy.contains("Account Activity").should("be.visible");

      cy.contains("Funds Transfer Received").click();
      cy.url().should("include", "transaction.htm");
      cy.contains("Transaction Details").should("be.visible");
    });

    it("should open a new savings account successfully", () => {
      cy.contains("Open New Account").click();
      cy.url().should("include", "openaccount.htm");

      cy.get("#type").select("SAVINGS");
      cy.get("#fromAccountId").select(0);
      cy.get('input[type="button"].button[value="Open New Account"]').click();

      cy.contains("Account Opened!").should("be.visible");
      cy.contains("Congratulations, your account is now open.").should(
        "be.visible"
      );
      cy.get("#newAccountId").should("be.visible").click();

      cy.contains("Account Details").should("be.visible");
      cy.contains("Account Activity").should("be.visible");

      cy.contains("Funds Transfer Received").click();
      cy.url().should("include", "transaction.htm");
      cy.contains("Transaction Details").should("be.visible");
    });
  });

  describe("Test Case 10: Account Overview", () => {
    it("should verify account details and transactions load correctly", () => {
      cy.contains("Accounts Overview").click();
      cy.url().should("include", "overview.htm");

      cy.get("#accountTable").should("be.visible");
      cy.get("#accountTable > thead > tr > th:nth-child(1)").should(
        "contain",
        "Account"
      );
      cy.get("#accountTable > thead > tr > th:nth-child(2)").should(
        "contain",
        "Balance"
      );
      cy.get("#accountTable > thead > tr > th:nth-child(3)").should(
        "contain",
        "Available Amount"
      );

      cy.get(
        "#accountTable > tbody > tr:nth-child(1) > td:nth-child(1) > a"
      ).click();

      cy.contains("Account Details").should("be.visible");
      cy.contains("Account Activity").should("be.visible");
      cy.contains("Funds Transfer Sent").click();
      cy.url().should("include", "transaction.htm");
      cy.contains("Transaction Details").should("be.visible");
    });
  });

  describe("Test Case 11: Validate Successful Fund Transfers", () => {
    it('should successfully transfer funds between accounts', () => {
        
        cy.contains('Transfer Funds').should('be.visible').click();
        cy.url().should('include', 'transfer.htm');
        cy.contains('Transfer Funds').should('be.visible');

        const transferAmount = '100';
        cy.get('#amount').type(transferAmount);
  
        cy.get('#fromAccountId').find('option').first().invoke('val').then(fromAccount => {
          cy.get('#fromAccountId').select(fromAccount);
  
          cy.get('#toAccountId').find('option').last().invoke('val').then(toAccount => {
            cy.get('#toAccountId').select(toAccount);
  
            cy.get('input[value="Transfer"]').click();
  
            cy.contains('Transfer Complete!').should('be.visible');

            cy.contains(new RegExp(`${transferAmount} has been transferred from account ${fromAccount} to account ${toAccount}`, 'i'))
            .should('be.visible');

            cy.contains('Accounts Overview').click();
            cy.url().should('include', 'overview.htm');
  
            cy.contains('Accounts Overview').should('be.visible');

            cy.get('#accountTable').should('be.visible');
            cy.get('#accountTable tbody tr').should('have.length.greaterThan', 1);
          });
        });
      });
  });
});

describe("Bill Payment Tests", () => {
    beforeEach(() => {
        cy.fixture("user").then((data) => {
            const user = data.validUser;
            cy.restoreSession(user.username, user.password);
    
            cy.visitHomePage();
            cy.contains(`Welcome ${user.firstName} ${user.lastName}`, { timeout: 10000 }).should("be.visible");
        });
      });

  describe("Test Case 12: Validate Successful Bill Payment", () => {
    it("should successfully pay a bill", () => {
      cy.contains("Bill Pay").click();
      cy.url().should("include", "billpay.htm");
      cy.contains("Bill Payment Service").should("be.visible");

      const payee = {
        name: "John Doe",
        address: "456 Main St",
        city: "Calgary",
        state: "Alberta",
        zipCode: "T2P 2G7",
        phone: "9876543210",
        accountNumber: "123456789",
        amount: "50",
      };

      cy.get("input[name='payee.name']").type(payee.name);
      cy.get("input[name='payee.address.street']").type(payee.address);
      cy.get("input[name='payee.address.city']").type(payee.city);
      cy.get("input[name='payee.address.state']").type(payee.state);
      cy.get("input[name='payee.address.zipCode']").type(payee.zipCode);
      cy.get("input[name='payee.phoneNumber']").type(payee.phone);
      cy.get("input[name='payee.accountNumber']").type(payee.accountNumber);
      cy.get("input[name='verifyAccount']").type(payee.accountNumber);
      cy.get("input[name='amount']").type(payee.amount);

      cy.get("input[value='Send Payment']").click();

      cy.contains("Bill Payment Complete").should("be.visible");
      cy.contains(
        new RegExp(
          `Bill Payment to ${payee.name} in the amount of \\$?${payee.amount}(.00)? from account \\d+ was successful.`,
          "i"
        )
      ).should("be.visible");

      cy.contains("Accounts Overview").click();
      cy.url().should("include", "overview.htm");
      cy.get("#accountTable").should("be.visible");

      cy.get("#accountTable tbody tr").should("have.length.greaterThan", 1);
    });
  });

  describe("Test Case 13: Validate Unsuccessful Bill Payment", () => {
    it("should display an error for a negative bill payment amount", () => {
      cy.contains("Bill Pay").click();
      cy.url().should("include", "billpay.htm");
      cy.contains("Bill Payment Service").should("be.visible");

      cy.get("input[name='payee.name']").type("Invalid Payee");
      cy.get("input[name='payee.address.street']").type("123 Fake St");
      cy.get("input[name='payee.address.city']").type("Nowhere");
      cy.get("input[name='payee.address.state']").type("ZZ");
      cy.get("input[name='payee.address.zipCode']").type("00000");
      cy.get("input[name='payee.phoneNumber']").type("1234567890");
      cy.get("input[name='payee.accountNumber']").type("999999");
      cy.get("input[name='verifyAccount']").type("999999");
      cy.get("input[name='amount']").type("-500");

      cy.get("input[value='Send Payment']").click();

      cy.contains("Please enter a valid amount").should("be.visible");
    });
  });

  describe("Test Case 14: Validate Empty Bill Payment", () => {
    it("should display required field warnings when bill payment form is empty", () => {
      cy.contains("Bill Pay").click();
      cy.url().should("include", "billpay.htm");
      cy.contains("Bill Payment Service").should("be.visible");

      cy.get("input[value='Send Payment']").click();

      cy.contains("Payee name is required.").should("be.visible");
      cy.contains("Address is required.").should("be.visible");
      cy.contains("City is required.").should("be.visible");
      cy.contains("State is required.").should("be.visible");
      cy.contains("Zip Code is required.").should("be.visible");
      cy.contains("Phone number is required.").should("be.visible");
      cy.contains("Account number is required.").should("be.visible");
      cy.contains("The amount cannot be empty").should("be.visible");
    });
  });
});

describe("Find Transactions Tests", () => {
    beforeEach(() => {
        cy.fixture("user").then((data) => {
            const user = data.validUser;
            cy.restoreSession(user.username, user.password);
    
            cy.visitHomePage();
            cy.contains(`Welcome ${user.firstName} ${user.lastName}`, { timeout: 10000 }).should("be.visible");

            cy.contains("Find Transactions").click();
            cy.url().should("include", "findtrans.htm");
        });
      });

  describe("Test Case 15: Verify Search Results Match The Entered Criteria - ID", () => {
    it("should search for a transaction using a valid ID and display matching results", () => {
      cy.contains("Accounts Overview").click();
      cy.get("table tbody tr td a").first().click();
      cy.contains("Funds Transfer Sent").first().click();

      cy.url().then((url) => {
        const transactionId = url.split("id=")[1];

        cy.get('a[href*="findtrans.htm"]').click();
        cy.get("#transactionForm").should("be.visible");
        cy.get("#transactionId").clear().type(transactionId);
        cy.get("#findById").click();
        cy.contains(transactionId).should("be.visible");
      });
    });
  });

  describe("Test Case 16: Validate Incorrect Search For Transaction By ID", () => {
    it("should display an error when an invalid transaction ID is entered", () => {
      cy.get('a[href*="findtrans.htm"]').click();
      cy.get("#transactionForm").should("be.visible");

      cy.get("#transactionId").clear().type("qwerty");
      cy.get("#findById").click();

      cy.get("#transactionIdError").should("contain", "Invalid transaction ID");
    });
  });

  describe("Test Case 17: Validate Empty Search For Transaction By ID", () => {
    it("should display a required field warning when no transaction ID is entered", () => {
      cy.get('a[href*="findtrans.htm"]').click();
      cy.get("#transactionForm").should("be.visible");

      cy.get("#findById").click();

      cy.get("#transactionIdError").should("contain", "Invalid transaction ID");
    });
  });

  describe("Test Case 18: Verify Search Results Match The Entered Criteria - Date", () => {
    it("should search for transactions using a valid date and display matching results", () => {
      const today = new Date();
      const formattedDate = `${(today.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${today
        .getDate()
        .toString()
        .padStart(2, "0")}-${today.getFullYear()}`;

      cy.get('a[href*="findtrans.htm"]').click();
      cy.get("#transactionForm").should("be.visible");

      cy.get("#transactionDate").clear().type(formattedDate);
      cy.get("#findByDate").click();

      cy.get("#transactionTable").should("be.visible");
      cy.get("#transactionTable").contains(formattedDate).should("be.visible");
      cy.get("#transactionTable")
        .contains("Funds Transfer Received")
        .should("be.visible");
    });
  });

  describe("Test Case 19: Validate Incorrect Search For Transaction By Date", () => {
    it("should display an error when an invalid date is entered", () => {
      cy.get('a[href*="findtrans.htm"]').click();
      cy.get("#transactionForm").should("be.visible");

      cy.get("#transactionDate").clear().type("99-99-9999");
      cy.get("#findByDate").click();

      cy.get("#transactionDateError").should("contain", "Invalid date format");
    });
  });

  describe("Test Case 20: Validate Empty Search For Transaction by Date", () => {
    it("should display a required field warning when no date is entered", () => {
      cy.get('a[href*="findtrans.htm"]').click();
      cy.get("#transactionForm").should("be.visible");

      cy.get("#findByDate").click();

      cy.get("#transactionDateError").should("contain", "Invalid date format");
    });
  });

  describe("Test Case 21: Verify Search Results Match The Entered Criteria - Date Range", () => {
    it("should search for transactions using a valid date range and display matching results", () => {
      const today = new Date();
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(today.getDate() - 3);

      const formatDate = (date) => {
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${month}-${day}-${year}`;
      };

      const formattedToday = formatDate(today);
      const formattedThreeDaysAgo = formatDate(threeDaysAgo);

      cy.get('a[href*="findtrans.htm"]').click();
      cy.get("#transactionForm").should("be.visible");

      cy.get("#fromDate").clear().type(formattedThreeDaysAgo);
      cy.get("#toDate").clear().type(formattedToday);
      cy.get("#findByDateRange").click();

      cy.get("#transactionTable").should("be.visible");
      cy.get("#transactionTable").contains(formattedToday).should("be.visible");
      cy.get("#transactionTable")
        .contains("Funds Transfer Received")
        .should("be.visible");
    });
  });

  describe("Test Case 22: Validate Incorrect Search For Transaction By Date Range", () => {
    it("should display an error when an invalid date range is entered", () => {
      cy.get('a[href*="findtrans.htm"]').click();
      cy.get("#transactionForm").should("be.visible");

      cy.get("#fromDate").clear().type("99-99-9999");
      cy.get("#toDate").clear().type("99-99-9999");
      cy.get("#findByDateRange").click();

      cy.get("#dateRangeError").should("contain", "Invalid date format");
    });
  });

  describe("Test Case 23: Validate Empty Search For Transaction by Date Range", () => {
    it("should display a required field warning when no date range is entered", () => {
      cy.get('a[href*="findtrans.htm"]').click();
      cy.get("#transactionForm").should("be.visible");

      cy.get("#findByDateRange").click();

      cy.get("#dateRangeError").should("contain", "Invalid date format");
    });
  });

  describe("Test Case 24: Verify Search Results Match The Entered Criteria - Amount", () => {
    it("should search for transactions using a valid amount and display matching results", () => {
      cy.get('a[href*="findtrans.htm"]').click();
      cy.get("#transactionForm").should("be.visible");

      cy.get("#amount").clear().type("100.00");
      cy.get("#findByAmount").click();

      cy.get("#transactionTable").should("be.visible");
      cy.get("#transactionTable")
        .contains("Funds Transfer Received")
        .should("be.visible");
      cy.get("#transactionTable").contains("100.00").should("be.visible");
    });
  });

  describe("Test Case 25: Validate Incorrect Search For Transaction By Amount", () => {
    it("should display an error when an invalid amount is entered", () => {
      cy.get('a[href*="findtrans.htm"]').click();
      cy.get("#transactionForm").should("be.visible");

      cy.get("#amount").clear().type("abcdef");
      cy.get("#findByAmount").click();

      cy.get("#amountError").should("contain", "Invalid amount");
    });
  });

  describe("Test Case 26: Validate Empty Search For Transaction By Amount", () => {
    it("should display a required field warning when no amount is entered", () => {
      cy.get('a[href*="findtrans.htm"]').click();
      cy.get("#transactionForm").should("be.visible");

      cy.get("#findByAmount").click();

      cy.get("#amountError").should("contain", "Invalid amount");
    });
  });
});

describe("Update Contact Info Tests", () => {

    beforeEach(() => {
        cy.fixture("user").then((data) => {
            const user = data.validUser;
            cy.restoreSession(user.username, user.password);
    
            cy.visitHomePage();
            cy.contains(`Welcome ${user.firstName} ${user.lastName}`, { timeout: 10000 }).should("be.visible");

            cy.contains("Update Contact Info").click();
            cy.url().should("include", "updateprofile.htm");
            cy.get("h1").contains("Update Profile").should("be.visible").wait(500);
        });
      });

  describe("Test Case 27: Validate Successful Contact Info Update", () => {
    it("should update contact information successfully", () => {
      cy.get("input[name='customer.address.street']")
        .clear()
        .type("456 Updated St");
      cy.get("input[name='customer.address.city']")
        .clear()
        .type("Updated City");
      cy.get("input[name='customer.address.state']")
        .clear()
        .type("Updated State");
      cy.get("input[name='customer.address.zipCode']").clear().type("12345");
      cy.get("input[name='customer.phoneNumber']").clear().type("1112223333");

      cy.get("input[value='Update Profile']").click();

      cy.contains("Profile Updated").should("be.visible");
      cy.contains(
        "Your updated address and phone number have been added to the system."
      ).should("be.visible");
    });
  });

  describe("Test Case 28: Validate Empty Contact Info Update", () => {
    it("should display required warnings when contact info is empty", () => {
      cy.get("input[name='customer.firstName']").clear();
      cy.get("input[name='customer.lastName']").clear();
      cy.get("input[name='customer.address.street']").clear();
      cy.get("input[name='customer.address.city']").clear();
      cy.get("input[name='customer.address.state']").clear();
      cy.get("input[name='customer.address.zipCode']").clear();
      cy.get("input[name='customer.phoneNumber']").clear();

      cy.get("input[value='Update Profile']").click();

      cy.contains("Last name is required").should("be.visible");
      cy.contains("Address is required").should("be.visible");
      cy.contains("City is required").should("be.visible");
      cy.contains("State is required").should("be.visible");
      cy.contains("Zip Code is required").should("be.visible");
      cy.contains("Phone number is required").should("be.visible");
    });
  });
});

describe("Loan Request and Logout Tests", () => {

    beforeEach(() => {
        cy.fixture("user").then((data) => {
            const user = data.validUser;
            cy.restoreSession(user.username, user.password);
    
            cy.visitHomePage();
            cy.contains(`Welcome ${user.firstName} ${user.lastName}`, { timeout: 10000 }).should("be.visible");
        });
      });

  describe("Test Case 29: Validate Successful Loan Request", () => {
    it("should process a loan request successfully and update account information", () => {
      cy.contains("Request Loan").click();
      cy.url().should("include", "requestloan.htm");

      cy.get("#amount").type("1000");
      cy.get("#downPayment").type("100");

      cy.get("#fromAccountId")
        .find("option")
        .first()
        .then((option) => {
          const account = option.val();
          cy.get("#fromAccountId").select(account);
        });

      cy.get("input[value='Apply Now']").click();

      cy.contains("Loan Request Processed").should("be.visible");
      cy.contains("Approved").should("be.visible");

      cy.get("a").contains(/\d+/).first().click();
      cy.contains("Account Details").should("be.visible");

      cy.contains("Accounts Overview").click();
      cy.url().should("include", "overview.htm");
      cy.get("#accountTable").should("be.visible");
    });
  });

  describe("Test Case 30: Validate Unsuccessful Loan Request", () => {
    it("should process a loan request unsuccessfully and display a denial message", () => {
      cy.contains("Request Loan").click();
      cy.url().should("include", "requestloan.htm");

      cy.get("#amount").type("100000000");
      cy.get("#downPayment").type("10");

      cy.get("#fromAccountId")
        .find("option")
        .first()
        .then((option) => {
          const account = option.val();
          cy.get("#fromAccountId").select(account);
        });

      cy.get("input[value='Apply Now']").click();

      cy.contains("Loan Request Processed").should("be.visible");
      cy.contains("Denied").should("be.visible");
    });
  });

  describe("Test Case 31: Validate Empty Loan Request", () => {
    it("should display required warnings when no loan details are entered", () => {
      cy.contains("Request Loan").click();
      cy.url().should("include", "requestloan.htm");

      cy.get("#fromAccountId")
        .find("option")
        .first()
        .then((option) => {
          const account = option.val();
          cy.get("#fromAccountId").select(account);
        });

      cy.get("input[value='Apply Now']").click();

      cy.contains("Loan amount is required").should("be.visible");
      cy.contains("Down payment is required").should("be.visible");
    });
  });

  describe("Test Case 32: Validate Customer Log Out", () => {
    it("should log out the customer and display the home page", () => {
      cy.contains("Log Out").click();

      cy.contains("Customer Login").should("be.visible");
    });
  });
});

describe("Customer Care Request Tests", () => {
  const contactDetails = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    message: "This is a test message.",
  };

  beforeEach(() => {
    cy.visitHomePage();
  });

  describe("Test Cases 33-35 Submissions Of Customer Care Requests", () => {
    it("should Validate Successful Submission Of Customer Care Requests From Top Navigation", () => {
      cy.get(".contact").first().click();
  
      cy.url().should("include", "contact.htm");
      cy.get('input[name="name"]').type(contactDetails.name);
      cy.get('input[name="email"]').type(contactDetails.email);
      cy.get('input[name="phone"]').type(contactDetails.phone);
      cy.get('textarea[name="message"]').type(contactDetails.message);
  
      cy.get('input[value="Send to Customer Care"]').click();
  
      cy.contains(`Thank you ${contactDetails.name}`).should("be.visible");
    });
  
    it("should Validate Successful Submission Of Customer Care Requests From Bottom Navigation", () => {
      cy.contains("Contact Us").click();
  
      cy.url().should("include", "contact.htm");
  
      cy.get('input[name="name"]').type(contactDetails.name);
      cy.get('input[name="email"]').type(contactDetails.email);
      cy.get('input[name="phone"]').type(contactDetails.phone);
      cy.get('textarea[name="message"]').type(contactDetails.message);
  
      cy.get('input[value="Send to Customer Care"]').click();
  
      cy.contains(`Thank you ${contactDetails.name}`).should("be.visible");
    });
  
    it("should Validate Empty Submission Of Customer Care Requests From Bottom Navigation", () => {
      cy.contains("Contact Us").click();
  
      cy.url().should("include", "contact.htm");
  
      cy.get('input[value="Send to Customer Care"]').click();
  
      cy.contains("Name is required").should("be.visible");
      cy.contains("Email is required").should("be.visible");
      cy.contains("Phone is required").should("be.visible");
      cy.contains("Message is required").should("be.visible");
    });
  });
});

describe('Responsive and Accessible Testing', () => {
  beforeEach(() => {
    cy.visit('https://parabank.parasoft.com/parabank/index.htm');
  });

  it('should displays correctly on mobile devices', () => {
    cy.viewport('iphone-6');
    cy.get('#headerPanel').should('be.visible');
    
    cy.injectAxe();
    cy.checkA11y();

    cy.checkA11y(null, null, (violations) => {
      cy.task('log', `${violations.length} accessibility violation(s) detected`);
      violations.forEach((violation) => {
        cy.task('log', `${violation.id}: ${violation.description}`);
      });
    });
  });

  it('should displays correctly on tablet devices', () => {
    cy.viewport('ipad-2');
    cy.get('#headerPanel').should('be.visible');
    
    cy.injectAxe();
    cy.checkA11y();

    cy.checkA11y(null, null, (violations) => {
      cy.task('log', `${violations.length} accessibility violation(s) detected`);
      violations.forEach((violation) => {
        cy.task('log', `${violation.id}: ${violation.description}`);
      });
    });
  });
});