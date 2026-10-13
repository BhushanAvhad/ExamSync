const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/server');

describe('ExamSync Backend API Endpoints', () => {

  test('1. GET / returns healthy service status', async () => {
    // Start temporary server listener on random ephemeral port
    const server = app.listen(0);
    const port = server.address().port;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.status, 'healthy');
      assert.equal(data.name, 'ExamSync Optimization Engine API');
    } finally {
      server.close();
    }
  });

  test('2. POST /api/timetable/generate rejects unauthenticated requests with 401', async () => {
    const server = app.listen(0);
    const port = server.address().port;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/timetable/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'dummy-id' }),
      });
      assert.equal(res.status, 401);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.ok(data.error.includes('Unauthorized'));
    } finally {
      server.close();
    }
  });

  test('3. POST /api/timetable/generate rejects missing sessionId with 400 when authorized', async () => {
    const server = app.listen(0);
    const port = server.address().port;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/timetable/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-test-override': 'true', // Test-only bypass header
        },
        body: JSON.stringify({}),
      });
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.ok(data.error.includes('sessionId is required'));
    } finally {
      server.close();
    }
  });

  test('4. POST /api/timetable/publish rejects missing sessionId with 400', async () => {
    const server = app.listen(0);
    const port = server.address().port;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/timetable/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-test-override': 'true',
        },
        body: JSON.stringify({}),
      });
      assert.equal(res.status, 400);
    } finally {
      server.close();
    }
  });
});
