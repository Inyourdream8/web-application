import { execSync } from 'child_process';
import { Client } from 'pg';

async function teardownTestEnvironment() {
  console.log('Cleaning up test environment...');

  try {
    // Clean up database
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    });
    
    await client.connect();
    
    // Drop test database
    await client.query('DROP DATABASE IF EXISTS test_db');
    await client.end();

    // Clean up Redis
    const Redis = require('ioredis');
    const redis = new Redis(process.env.REDIS_URL);
    await redis.flushdb();
    await redis.quit();

    // Stop any running test services
    try {
      execSync('pkill -f "flask run"', { stdio: 'ignore' });
    } catch (error) {
      // Ignore errors from pkill if no process was found
    }

    // Clean up test artifacts
    execSync('rm -rf test-reports/*.json test-reports/*.html test-reports/*.md', {
      stdio: 'ignore'
    });

    // Remove temporary files
    execSync('rm -rf ./tmp/* ./coverage/*', { stdio: 'ignore' });

  } catch (error) {
    console.error('Error during test environment cleanup:', error);
    throw error;
  }

  console.log('Test environment cleanup complete.');
}

export default teardownTestEnvironment;