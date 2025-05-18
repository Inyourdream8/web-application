import { defineConfig } from 'cypress';
import { execSync } from 'child_process';
import { Client } from 'pg';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {
      on('task', {
        'db:reset': () => {
          execSync('flask db downgrade base && flask db upgrade');
          return null;
        },
        'db:seed': () => {
          execSync('python backend/tests/seed_test_data.py');
          return null;
        },
        'admin:approveLoan': async ({ loanId }) => {
          const client = new Client({
            connectionString: config.env.TEST_DATABASE_URL
          });
          await client.connect();
          await client.query(
            'UPDATE loans SET status = $1 WHERE id = $2',
            ['approved', loanId]
          );
          await client.end();
          return null;
        }
      });
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    retries: {
      runMode: 2,
      openMode: 0
    },
    env: {
      TEST_DATABASE_URL: 'postgresql://localhost/test_db'
    }
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite'
    }
  }
});