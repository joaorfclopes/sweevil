import { config } from 'dotenv';
import { readFileSync } from 'fs';

config({ path: new URL('../../.env', import.meta.url).pathname, override: false });

const { uri } = JSON.parse(readFileSync('/tmp/jest-mongo-config.json', 'utf-8'));

process.env.MONGODB_URL = uri;
process.env.BETTER_AUTH_SECRET = 'test-better-auth-secret-min32chars!!';
process.env.ALLOWED_EMAILS = 'admin@test.com';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_TEST_SECRET_KEY || 'sk_test_placeholder';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_webhook_secret_for_tests_only';
process.env.BETTER_AUTH_URL = 'http://localhost:5000';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.NODE_ENV = 'test';
process.env.MOCK_S3 = 'true';
process.env.DISABLE_EMAILS = 'true';
process.env.BRAND_NAME = 'TestStudio';
process.env.APP_DOMAIN = 'localhost';
process.env.AWS_S3_BUCKET = 'test-bucket';
process.env.AWS_REGION = 'us-east-1';
