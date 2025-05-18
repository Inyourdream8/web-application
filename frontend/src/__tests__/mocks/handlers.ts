import { rest } from 'msw';

export const handlers = [
  // Auth endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        access_token: 'mock-jwt-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com'
        }
      })
    );
  }),

  rest.get('/api/auth/me', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      })
    );
  }),

  // Loan endpoints
  rest.post('/api/loans/apply', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        loan_id: 'mock-loan-id',
        status: 'applied',
        amount: 5000,
        duration_months: 12
      })
    );
  }),

  rest.get('/api/loans/:id/status', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        loan_id: id,
        status: 'processing',
        steps_completed: ['application', 'documents_submitted'],
        next_step: 'verification'
      })
    );
  }),

  // Admin dashboard endpoints
  rest.get('/api/admin/dashboard/stats', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        total_loans: 100,
        active_loans: 75,
        total_users: 500,
        monthly_disbursement: 250000
      })
    );
  }),

  // User account endpoints
  rest.get('/api/account/transactions', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        transactions: [
          {
            id: 1,
            type: 'loan_disbursement',
            amount: 5000,
            date: '2025-05-07T10:00:00Z'
          },
          {
            id: 2,
            type: 'repayment',
            amount: -500,
            date: '2025-05-07T15:00:00Z'
          }
        ]
      })
    );
  }),

  // Error scenarios
  rest.post('/api/auth/login', (req, res, ctx) => {
    const { username, password } = req.body as any;
    if (username === 'error_user') {
      return res(
        ctx.status(401),
        ctx.json({
          error: 'Invalid credentials'
        })
      );
    }
    // Continue with successful login for other cases
  }),

  rest.post('/api/loans/apply', (req, res, ctx) => {
    const { amount } = req.body as any;
    if (amount > 50000) {
      return res(
        ctx.status(400),
        ctx.json({
          error: 'Amount exceeds maximum loan limit'
        })
      );
    }
    // Continue with successful application for valid amounts
  })
];