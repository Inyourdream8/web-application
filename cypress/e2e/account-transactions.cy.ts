describe('Account & Transactions E2E Tests', () => {
  beforeEach(() => {
    cy.task('db:reset');
    cy.task('db:seed');
    cy.login('testuser@example.com', 'Test123!');
  });

  it('displays account overview and balance', () => {
    cy.visit('/account');
    
    // Verify account information is displayed
    cy.get('[data-testid="account-balance"]').should('be.visible');
    cy.get('[data-testid="available-credit"]').should('be.visible');
    cy.get('[data-testid="next-payment"]').should('be.visible');

    // Check transaction history
    cy.get('[data-testid="transaction-history"]')
      .should('be.visible')
      .and('not.be.empty');
  });

  it('handles loan repayment process', () => {
    cy.visit('/account/payments');
    
    // Select payment method
    cy.get('[data-testid="payment-method"]').click();
    cy.get('[data-testid="add-card"]').click();
    
    // Add payment method
    cy.get('[data-testid="card-number"]').type('4242424242424242');
    cy.get('[data-testid="card-expiry"]').type('1229');
    cy.get('[data-testid="card-cvc"]').type('123');
    cy.get('[data-testid="save-card"]').click();

    // Make payment
    cy.get('[data-testid="payment-amount"]').type('500');
    cy.get('[data-testid="submit-payment"]').click();

    // Verify payment success
    cy.get('[data-testid="payment-success"]').should('be.visible');
    cy.get('[data-testid="new-balance"]').should('be.visible');
  });

  it('manages account settings and preferences', () => {
    cy.visit('/account/settings');
    
    // Update notification preferences
    cy.get('[data-testid="email-notifications"]').click();
    cy.get('[data-testid="sms-notifications"]').click();
    cy.get('[data-testid="save-preferences"]').click();

    // Verify preferences are saved
    cy.get('[data-testid="preferences-saved"]').should('be.visible');
    
    // Update personal information
    cy.get('[data-testid="edit-profile"]').click();
    cy.get('[data-testid="phone-number"]').clear().type('+1234567890');
    cy.get('[data-testid="save-profile"]').click();

    // Verify changes
    cy.get('[data-testid="profile-updated"]').should('be.visible');
  });

  it('downloads account statements', () => {
    cy.visit('/account/statements');
    
    // Select date range
    cy.get('[data-testid="date-range"]').click();
    cy.get('[data-testid="last-month"]').click();
    
    // Generate statement
    cy.get('[data-testid="generate-statement"]').click();
    
    // Verify download
    cy.get('[data-testid="download-statement"]').should('be.visible');
    cy.get('[data-testid="download-statement"]').click();
    
    // Check file download
    cy.readFile('cypress/downloads/account-statement.pdf').should('exist');
  });

  it('handles transaction disputes', () => {
    cy.visit('/account/transactions');
    
    // Select transaction to dispute
    cy.get('[data-testid="transaction-item"]').first().click();
    cy.get('[data-testid="dispute-transaction"]').click();
    
    // Fill dispute form
    cy.get('[data-testid="dispute-reason"]').select('incorrect_amount');
    cy.get('[data-testid="dispute-description"]').type('Amount charged is incorrect');
    cy.get('[data-testid="submit-dispute"]').click();
    
    // Verify dispute submission
    cy.get('[data-testid="dispute-confirmation"]').should('be.visible');
    cy.get('[data-testid="dispute-reference"]').should('be.visible');
  });

  it('validates security measures', () => {
    cy.visit('/account/security');
    
    // Enable 2FA
    cy.get('[data-testid="enable-2fa"]').click();
    
    // Verify phone number
    cy.get('[data-testid="verify-phone"]').type('+1234567890');
    cy.get('[data-testid="send-code"]').click();
    
    // Enter verification code
    cy.get('[data-testid="verification-code"]').type('123456');
    cy.get('[data-testid="verify-code"]').click();
    
    // Confirm 2FA is enabled
    cy.get('[data-testid="2fa-status"]').should('contain', 'Enabled');
  });

  it('handles session timeout', () => {
    cy.visit('/account');
    
    // Simulate session timeout
    cy.clock().tick(3600000); // Advance time by 1 hour
    
    // Attempt to perform action
    cy.get('[data-testid="refresh-balance"]').click();
    
    // Should be redirected to login
    cy.url().should('include', '/login');
    
    // Verify session expired message
    cy.get('[data-testid="session-expired"]').should('be.visible');
  });

  it('tracks performance metrics', () => {
    cy.visit('/account');
    
    // Measure initial load time
    cy.measurePageLoad().then((loadTime) => {
      expect(loadTime).to.be.lessThan(2000); // 2 seconds threshold
    });
    
    // Test rapid navigation
    const pages = [
      '/account/transactions',
      '/account/payments',
      '/account/statements',
      '/account/settings'
    ];
    
    pages.forEach(page => {
      cy.visit(page);
      cy.waitForLoadingState();
      cy.get('[data-testid="page-content"]').should('be.visible');
    });
  });
});