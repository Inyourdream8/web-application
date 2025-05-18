import '@testing-library/cypress/add-commands';

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('[data-testid="email"]').type(email);
    cy.get('[data-testid="password"]').type(password);
    cy.get('[data-testid="login-submit"]').click();
    cy.url().should('not.include', '/login');
  });
});

Cypress.Commands.add('resetDatabase', () => {
  cy.task('db:reset');
});

Cypress.Commands.add('seedTestData', () => {
  cy.task('db:seed');
});

// Custom command for checking loading states
Cypress.Commands.add('waitForLoadingState', () => {
  cy.get('[data-testid="loading-spinner"]').should('not.exist');
});

// Command to intercept and wait for API calls
Cypress.Commands.add('waitForApi', (method: string, url: string) => {
  cy.intercept(method, url).as('apiCall');
  cy.wait('@apiCall');
});

// Command to check accessibility
Cypress.Commands.add('checkA11y', (context = null, options = null) => {
  cy.injectAxe();
  cy.checkA11y(context, options);
});

// Performance monitoring command
Cypress.Commands.add('measurePageLoad', () => {
  cy.window().then((win) => {
    const perfData = win.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    cy.log(`Page Load Time: ${pageLoadTime}ms`);
    return pageLoadTime;
  });
});

// Command to simulate network conditions
Cypress.Commands.add('setNetworkConditions', (condition: 'online' | '3g' | '2g' | 'offline') => {
  if (condition === 'offline') {
    cy.window().then((win) => {
      cy.stub(win.navigator, 'onLine').value(false);
    });
  } else {
    cy.window().then((win) => {
      cy.stub(win.navigator.connection, 'effectiveType').value(condition);
    });
  }
});