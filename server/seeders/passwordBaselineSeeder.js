/**
 * passwordBaselineSeeder.js
 * 
 * This is a controlled baseline data seeder based on industry benchmarks
 * (cite: FIDO Alliance Report 2023, Google Password Manager Study).
 * 
 * It generates realistic baseline data for the "password" method to populate 
 * the dashboard's comparative charts, as actual password features were 
 * intentionally removed in favor of passwordless WebAuthn.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import AuthLog from '../models/AuthLog.js';
import PerformanceLog from '../models/PerformanceLog.js';

const seedPasswordBaseline = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI is not defined in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Baseline Seeding...');

    // 1. Idempotency Check: Verify if data already exists to prevent duplicates
    const existingAuthLogs = await AuthLog.countDocuments({ method: 'password' });
    const existingPerfLogs = await PerformanceLog.countDocuments({ authMethod: 'password', endpoint: '/api/auth/login' });

    if (existingAuthLogs > 0 || existingPerfLogs > 0) {
      console.log('Password baseline data already exists in the database.');
      console.log('Skipping insertion to prevent duplicates and maintain idempotency.');
      process.exit(0);
    }

    const NUM_ENTRIES = 50;
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    const authLogsToInsert = [];
    const perfLogsToInsert = [];

    for (let i = 0; i < NUM_ENTRIES; i++) {
        // Spread payload timestamps realistically over the last 30 days
        const randomTimeOffset = Math.floor(Math.random() * thirtyDaysMs);
        const timestamp = new Date(now - randomTimeOffset);

        // Simulate industry standard ~85% success rate for passwords
        const isSuccess = Math.random() < 0.85;

        // 1. Generate AuthLog Payload
        // Realistic duration between 200ms and 400ms
        const authDuration = Math.floor(Math.random() * 200) + 200;

        authLogsToInsert.push({
            method: 'password',
            success: isSuccess,
            duration: authDuration,
            timestamp: timestamp,
            errorMessage: isSuccess ? null : (Math.random() > 0.5 ? 'invalid_credentials' : 'account_locked'),
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 BaselineSeeder',
        });

        // 2. Generate PerformanceLog Payload
        // Average 250ms, with P95 spikes around 600ms
        const isSlow = Math.random() < 0.05; // 5% chance of being slow
        const respTime = isSlow ? Math.floor(Math.random() * 200) + 500 : Math.floor(Math.random() * 200) + 150;

        perfLogsToInsert.push({
            endpoint: '/api/auth/login',
            httpMethod: 'POST',
            authMethod: 'password',
            responseTime: respTime,
            requestSize: Math.floor(Math.random() * 50) + 120, // 120-170 bytes
            responseSize: isSuccess ? (Math.floor(Math.random() * 100) + 500) : (Math.floor(Math.random() * 50) + 150),
            statusCode: isSuccess ? 200 : 401,
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            createdAt: timestamp,
            updatedAt: timestamp
        });
    }

    // Insert to DB
    const insertedAuth = await AuthLog.insertMany(authLogsToInsert);
    const insertedPerf = await PerformanceLog.insertMany(perfLogsToInsert);

    // Print summary as requested
    console.log(`\n=== SEED SUMMARY ===`);
    console.log(`Inserted ${insertedAuth.length} AuthLog documents (Password Baseline).`);
    console.log(`Inserted ${insertedPerf.length} PerformanceLog documents (Password Baseline).`);
    console.log(`====================\n`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedPasswordBaseline();
