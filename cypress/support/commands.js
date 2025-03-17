//Command to Visit the Home Page
Cypress.Commands.add("visitHomePage", () => {
    cy.visit("https://parabank.parasoft.com/parabank/index.htm");
    cy.get("body").should("be.visible");
    cy.url().should("include", "parabank.parasoft.com/parabank/index.htm");
  });
  
  //Command for Registration
  Cypress.Commands.add("registerUser", (user) => {
    cy.contains("Register").should("be.visible").click();
    cy.contains("Signing up is easy!").should("be.visible");
  
    cy.get("input[name='customer.firstName']").type(user.firstName);
    cy.get("input[name='customer.lastName']").type(user.lastName);
    cy.get("input[name='customer.address.street']").type(user.address.street);
    cy.get("input[name='customer.address.city']").type(user.address.city);
    cy.get("input[name='customer.address.state']").type(user.address.state);
    cy.get("input[name='customer.address.zipCode']").type(user.address.zipCode);
    cy.get("input[name='customer.phoneNumber']").type(user.phoneNumber);
    cy.get("input[name='customer.ssn']").type(user.ssn);
    cy.get("input[name='customer.username']").type(user.username);
    cy.get("input[name='customer.password']").type(user.password);
    cy.get("input[name='repeatedPassword']").type(user.password);
  
    cy.get("input[value='Register']").click();
    cy.contains(`Welcome ${user.username}`).should("be.visible");
  });
  
  //Command for Login
  Cypress.Commands.add("login", (username, password) => {
    cy.get("input[name='username']").type(username);
    cy.get("input[name='password']").type(password);
    cy.get("input[value='Log In']").click();
    //cy.contains("Welcome").should("be.visible");
  });

  // Command to restore a session
  Cypress.Commands.add("restoreSession", (username, password) => {
    cy.session(["userSession", username], () => {
        cy.visit("https://parabank.parasoft.com/parabank/index.htm");
        cy.login(username, password);
        cy.contains(`Welcome`).should("be.visible");
    });
});
  
  //Command for Password Recovery
  Cypress.Commands.add("recoverPassword", (user) => {
    cy.contains("Forgot login info?").should("be.visible").click();
    cy.get("input[name='firstName']").type(user.firstName);
    cy.get("input[name='lastName']").type(user.lastName);
    cy.get("input[name='address.street']").type(user.address.street);
    cy.get("input[name='address.city']").type(user.address.city);
    cy.get("input[name='address.state']").type(user.address.state);
    cy.get("input[name='address.zipCode']").type(user.address.zipCode);
    cy.get("input[name='ssn']").type(user.ssn);
    cy.get("input[value='Find My Login Info']").click();
  });

  import 'cypress-axe';