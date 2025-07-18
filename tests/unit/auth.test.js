const request = require('supertest');
const app = require('../../server');
const jwtService = require('../../src/utils/jwtService');

describe('Authentication Tests', () => {
  describe('JWT Service', () => {
    test('should generate valid access token', () => {
      const payload = { userId: '123', email: 'test@example.com' };
      const token = jwtService.generateAccessToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    test('should verify valid access token', () => {
      const payload = { userId: '123', email: 'test@example.com' };
      const token = jwtService.generateAccessToken(payload);
      const decoded = jwtService.verifyAccessToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    test('should throw error for invalid token', () => {
      expect(() => {
        jwtService.verifyAccessToken('invalid-token');
      }).toThrow('Invalid access token');
    });
  });

  describe('Google OAuth Routes', () => {
    test('should redirect to Google OAuth', async () => {
      const response = await request(app)
        .get('/api/v1/auth/google')
        .expect(302);

      expect(response.headers.location).toContain('accounts.google.com');
    });

    test('should return 401 for failed auth', async () => {
      await request(app)
        .get('/api/v1/auth/failed')
        .expect(401)
        .expect(res => {
          expect(res.body.message).toBe('Login failed');
        });
    });
  });
});
