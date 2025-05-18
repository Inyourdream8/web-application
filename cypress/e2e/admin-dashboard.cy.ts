describe('Admin Dashboard E2E Tests', () => {
  beforeEach(() => {
    cy.task('db:reset');
    cy.task('db:seed');
    // Login as admin
    cy.login('admin@example.com', 'AdminPass123!');
    cy.visit('/admin/dashboard');
  });

  it('displays key metrics and statistics', () => {
    // Check dashboard components are loaded
    cy.get('[data-testid="total-loans"]').should('be.visible');
    cy.get('[data-testid="active-loans"]').should('be.visible');
    cy.get('[data-testid="total-users"]').should('be.visible');
    cy.get('[data-testid="monthly-disbursement"]').should('be.visible');

    // Verify metrics have values
    cy.get('[data-testid="total-loans"]').should('not.have.text', '0');
    cy.get('[data-testid="active-loans"]').should('not.have.text', '0');
  });

  it('processes loan approval workflow', () => {
    // Navigate to pending loans
    cy.get('[data-testid="pending-loans-tab"]').click();

    // Select a loan for review
    cy.get('[data-testid="loan-item"]').first().click();

    // Verify loan details
    cy.get('[data-testid="loan-details"]').should('be.visible');
    cy.get('[data-testid="applicant-info"]').should('be.visible');
    cy.get('[data-testid="document-verification"]').should('be.visible');

    // Approve loan
    cy.get('[data-testid="approve-button"]').click();
    cy.get('[data-testid="approval-amount"]').type('5000');
    cy.get('[data-testid="confirm-approval"]').click();

    // Verify approval status
    cy.get('[data-testid="loan-status"]').should('contain', 'Approved');
  });

  it('handles loan rejection workflow', () => {
    cy.get('[data-testid="pending-loans-tab"]').click();
    cy.get('[data-testid="loan-item"]').first().click();
    
    // Reject loan
    cy.get('[data-testid="reject-button"]').click();
    cy.get('[data-testid="rejection-reason"]').type('Insufficient documentation');
    cy.get('[data-testid="confirm-rejection"]').click();

    // Verify rejection status
    cy.get('[data-testid="loan-status"]').should('contain', 'Rejected');
  });

  it('manages user accounts', () => {
    // Navigate to user management
    cy.get('[data-testid="user-management-tab"]').click();

    // Search for user
    cy.get('[data-testid="user-search"]').type('testuser@example.com');
    cy.get('[data-testid="search-button"]').click();

    // Verify user details
    cy.get('[data-testid="user-details"]').should('be.visible');

    // Toggle user account status
    cy.get('[data-testid="suspend-user"]').click();
    cy.get('[data-testid="confirm-suspension"]').click();
    cy.get('[data-testid="user-status"]').should('contain', 'Suspended');
  });

  it('generates and downloads reports', () => {
    // Navigate to reports section
    cy.get('[data-testid="reports-tab"]').click();

    // Generate monthly report
    cy.get('[data-testid="report-type"]').select('monthly');
    cy.get('[data-testid="generate-report"]').click();

    // Verify download
    cy.get('[data-testid="download-report"]').should('be.visible');
    cy.get('[data-testid="download-report"]').click();

    // Verify file download
    cy.readFile('cypress/downloads/monthly-report.csv').should('exist');
  });

  it('monitors system performance', () => {
    // Check performance metrics loading
    cy.measurePageLoad().then((loadTime) => {
      expect(loadTime).to.be.lessThan(3000); // 3 seconds threshold
    });

    // Test rapid interactions
    for (let i = 0; i < 5; i++) {
      cy.get('[data-testid="pending-loans-tab"]').click();
      cy.get('[data-testid="approved-loans-tab"]').click();
      cy.get('[data-testid="rejected-loans-tab"]').click();
    }

    // Verify responsiveness
    cy.get('[data-testid="dashboard-content"]').should('be.visible');
  });

  it('validates admin permissions', () => {
    // Logout
    cy.get('[data-testid="logout"]').click();

    // Login as regular user
    cy.login('user@example.com', 'UserPass123!');

    // Attempt to access admin dashboard
    cy.visit('/admin/dashboard');

    // Should be redirected to unauthorized page
    cy.url().should('include', '/unauthorized');
  });
});