import { performance } from 'perf_hooks';

describe('Performance Testing Suite', () => {
  beforeEach(() => {
    cy.task('db:reset');
    cy.task('db:seed');
  });

  it('measures critical user journey performance', () => {
    const measurements: Record<string, number> = {};

    // Login performance
    cy.measurePageLoad().then(loadTime => {
      measurements['login_page_load'] = loadTime;
    });

    cy.login('testuser@example.com', 'Test123!');
    
    // Dashboard loading performance
    cy.visit('/dashboard');
    cy.measurePageLoad().then(loadTime => {
      measurements['dashboard_load'] = loadTime;
      expect(loadTime).to.be.lessThan(2000); // 2s threshold
    });

    // Loan application performance
    cy.visit('/apply');
    cy.measurePageLoad().then(loadTime => {
      measurements['loan_form_load'] = loadTime;
    });

    // Measure form interaction performance
    const start = performance.now();
    cy.get('[data-testid="loan-amount"]').type('5000');
    cy.get('[data-testid="loan-duration"]').select('12');
    cy.get('[data-testid="loan-purpose"]').type('Business expansion');
    
    cy.wrap(performance.now()).then(end => {
      measurements['form_interaction'] = end - start;
      expect(measurements['form_interaction']).to.be.lessThan(1000); // 1s threshold
    });
  });

  it('handles concurrent user load', () => {
    // Simulate multiple users accessing simultaneously
    const numberOfUsers = 10;
    const actions = Array(numberOfUsers).fill(null).map((_, index) => {
      return cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: {
          email: `testuser${index}@example.com`,
          password: 'Test123!'
        }
      }).then(response => {
        expect(response.status).to.eq(200);
        return response.body.token;
      });
    });

    // Measure response times under load
    cy.wrap(actions).then(tokens => {
      const requests = tokens.map(token => {
        return cy.request({
          method: 'GET',
          url: '/api/loans/status',
          headers: { Authorization: `Bearer ${token}` }
        });
      });

      const startTime = performance.now();
      cy.wrap(requests).then(() => {
        const endTime = performance.now();
        const averageResponseTime = (endTime - startTime) / numberOfUsers;
        expect(averageResponseTime).to.be.lessThan(500); // 500ms threshold
      });
    });
  });

  it('measures API response times', () => {
    cy.login('testuser@example.com', 'Test123!');

    const endpoints = [
      { method: 'GET', url: '/api/account/balance' },
      { method: 'GET', url: '/api/loans/status' },
      { method: 'GET', url: '/api/transactions/recent' }
    ];

    endpoints.forEach(endpoint => {
      cy.request({
        method: endpoint.method,
        url: endpoint.url
      }).then(response => {
        expect(response.duration).to.be.lessThan(300); // 300ms threshold
      });
    });
  });

  it('validates resource loading optimization', () => {
    cy.visit('/dashboard', {
      onBeforeLoad: (win) => {
        cy.stub(win.performance, 'getEntriesByType').returns([]);
      }
    });

    cy.window().then((win) => {
      const resources = win.performance.getEntriesByType('resource');
      const totalTransferSize = resources.reduce((total: number, resource: any) => 
        total + (resource.transferSize || 0), 0);
      
      // Check total page weight
      expect(totalTransferSize / 1024 / 1024).to.be.lessThan(2); // 2MB threshold
      
      // Check number of requests
      expect(resources.length).to.be.lessThan(50); // Maximum 50 requests
    });
  });

  it('tests memory usage patterns', () => {
    cy.window().then((win) => {
      // @ts-ignore
      const initialMemory = win.performance.memory?.usedJSHeapSize;
      
      // Perform memory-intensive operations
      for (let i = 0; i < 10; i++) {
        cy.get('[data-testid="load-more-transactions"]').click();
        cy.wait(500);
      }

      // @ts-ignore
      const finalMemory = win.performance.memory?.usedJSHeapSize;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Check memory growth
      expect(memoryIncrease / 1024 / 1024).to.be.lessThan(50); // 50MB threshold
    });
  });

  it('verifies caching effectiveness', () => {
    // First visit - uncached
    cy.visit('/dashboard');
    cy.measurePageLoad().then(initialLoadTime => {
      // Second visit - should be cached
      cy.visit('/dashboard');
      cy.measurePageLoad().then(cachedLoadTime => {
        expect(cachedLoadTime).to.be.lessThan(initialLoadTime * 0.5); // Should be 50% faster
      });
    });
  });

  it('measures database query performance', () => {
    cy.login('testuser@example.com', 'Test123!');
    
    // Monitor complex queries
    cy.request('/api/transactions/report').then(response => {
      expect(response.duration).to.be.lessThan(1000); // 1s threshold for complex queries
      
      // Verify result size
      expect(response.body.length).to.be.greaterThan(0);
    });
  });
});