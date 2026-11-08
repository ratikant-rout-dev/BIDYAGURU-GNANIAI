require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('../src/app');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const RefreshToken = require('../src/models/RefreshToken');

async function runAuthLifecycleTests() {
  console.log('\n======================================================');
  console.log('🧪 Starting Authentication & Token Lifecycle Test Suite');
  console.log('======================================================\n');

  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5096, resolve));
  const BASE_URL = 'http://localhost:5096';

  const results = [];
  function assert(name, condition, details = '') {
    results.push({ name, passed: !!condition, details });
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
    } else {
      console.log(`❌ [FAIL] ${name} - ${details}`);
    }
  }

  const testEmail = `auth_test_${Date.now()}@bidyaguru.edu`;
  let accessToken = '';
  let refreshToken1 = '';
  let refreshToken2 = '';
  let userCookies = '';

  try {
    // 1. Register candidate via /api/auth/register
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Authentication Tester',
        email: testEmail,
        password: 'Password@123',
        preferredLanguage: 'en-IN',
      }),
    });
    const regJson = await regRes.json();
    accessToken = regJson.accessToken;
    userCookies = regRes.headers.get('set-cookie') || '';

    // Extract refreshToken cookie
    const match = userCookies.match(/refreshToken=([^;]+)/);
    refreshToken1 = match ? match[1] : '';

    assert('POST /api/auth/register creates user and sets auth cookies', regRes.status === 201 && !!accessToken);
    assert('Registration sets HTTP-only refreshToken cookie', !!refreshToken1);

    // 2. Verify hashed token stored in DB
    const storedToken1 = await RefreshToken.findOne({ userId: regJson.user.id });
    assert('RefreshToken model persisted hashed token', !!storedToken1 && !!storedToken1.family);

    // 3. GET /api/auth/me
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const meJson = await meRes.json();
    assert('GET /api/auth/me returns authenticated user', meRes.ok && meJson.user?.email === testEmail);

    // 4. Token Refresh & Rotation via POST /api/auth/refresh
    const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refreshToken=${refreshToken1}`,
      },
      body: JSON.stringify({ refreshToken: refreshToken1 }),
    });
    const refreshJson = await refreshRes.json();
    const refreshCookies = refreshRes.headers.get('set-cookie') || '';
    const match2 = refreshCookies.match(/refreshToken=([^;]+)/);
    refreshToken2 = match2 ? match2[1] : '';

    assert(
      'POST /api/auth/refresh rotates token and issues new accessToken',
      refreshRes.ok && !!refreshJson.accessToken && !!refreshToken2 && refreshToken2 !== refreshToken1
    );

    // 5. Verify old token marked isRevoked: true in DB
    const oldTokenDoc = await RefreshToken.findOne({ tokenHash: storedToken1.tokenHash });
    assert('Previous refresh token is marked as revoked in database', oldTokenDoc?.isRevoked === true);

    // 6. REUSE DETECTION TEST: Presenting revoked token (refreshToken1) must trigger reuse detection and revoke family!
    console.log('🔒 Testing Token Reuse Detection...');
    const reuseRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refreshToken=${refreshToken1}`,
      },
      body: JSON.stringify({ refreshToken: refreshToken1 }),
    });

    assert(
      'Security: Reuse of revoked token is rejected with 401',
      reuseRes.status === 401
    );

    // Verify all tokens in that family were revoked
    const familyTokens = await RefreshToken.find({ family: storedToken1.family });
    const allRevoked = familyTokens.every((t) => t.isRevoked);
    assert(
      'Security: Entire token family invalidated on reuse detection',
      familyTokens.length >= 2 && allRevoked
    );

    // 7. Login again
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password@123',
      }),
    });
    const loginJson = await loginRes.json();
    const loginCookies = loginRes.headers.get('set-cookie') || '';
    const matchLogin = loginCookies.match(/refreshToken=([^;]+)/);
    const loginRefreshToken = matchLogin ? matchLogin[1] : '';

    assert('POST /api/auth/login works after revocation', loginRes.ok && !!loginJson.accessToken);

    // 8. Logout single session
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${loginJson.accessToken}`,
        Cookie: `refreshToken=${loginRefreshToken}`,
      },
      body: JSON.stringify({ refreshToken: loginRefreshToken }),
    });
    assert('POST /api/auth/logout clears session', logoutRes.ok);

    // Verify logged out token is revoked
    const postLogoutRefresh = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: loginRefreshToken }),
    });
    assert('Logged out refresh token cannot refresh access', postLogoutRefresh.status === 401);

    // Clean up test user
    await User.deleteMany({ email: testEmail });
    await RefreshToken.deleteMany({ userId: regJson.user.id });

    console.log('\n======================================================');
    const allPassed = results.every((r) => r.passed);
    console.log(`Auth Lifecycle Summary: ${results.filter((r) => r.passed).length}/${results.length} passed`);
    if (allPassed) {
      console.log('🎉 ALL BACKEND AUTH LIFECYCLE TESTS PASSED!');
    } else {
      console.log('❌ Some auth tests failed.');
    }
    console.log('======================================================\n');
  } catch (error) {
    console.error('Fatal auth lifecycle error:', error);
  } finally {
    server.close();
    await mongoose.connection.close();
    process.exit(results.every((r) => r.passed) ? 0 : 1);
  }
}

runAuthLifecycleTests();
