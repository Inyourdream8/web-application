import { execSync } from 'child_process';
import { Client } from 'pg';

async function setupTestEnvironment() {
  console.log('Setting up test environment...');

  // Set environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.FLASK_ENV = 'testing';
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/test_db';
  process.env.REDIS_URL = 'redis://localhost:6379/1';

  try {
    // Reset database
    console.log('Resetting test database...');
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    });
    
    await client.connect();
    
    // Drop and recreate test database
    await client.query(`
      DROP DATABASE IF EXISTS test_db;
      CREATE DATABASE test_db;
    `);
    
    await client.end();

    // Run migrations
    console.log('Running database migrations...');
    execSync('cd backend && flask db upgrade', { stdio: 'inherit' });

    // Seed test data
    console.log('Seeding test data...');
    execSync('cd backend && python tests/seed_test_data.py', { stdio: 'inherit' });

    // Start test services if needed
    console.log('Starting test services...');
    
    // Clear Redis test database
    const Redis = require('ioredis');
    const redis = new Redis(process.env.REDIS_URL);
    await redis.flushdb();
    await redis.quit();

  } catch (error) {
    console.error('Error during test environment setup:', error);
    throw error;
  }

  console.log('Test environment setup complete.');
}

export default setupTestEnvironment;