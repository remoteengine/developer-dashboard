const request = require('supertest');
const app = require('../../server');

describe('API Integration Tests', () => {
  describe('Health Check', () => {
    test('should return 200 for health check', async () => {
      const response = await request(app)
        .get('/api/v1/healthcheck')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('ts');
      expect(response.body.data).toHaveProperty('serviceName');
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limits', async () => {
      // Make multiple requests to test rate limiting
      const promises = Array(150)
        .fill()
        .map(() => request(app).get('/api/v1/healthcheck'));

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(res => res.status === 429);

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    }, 10000);
  });

  describe('Security Headers', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/api/v1/healthcheck')
        .expect(200);

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });
  });
});
