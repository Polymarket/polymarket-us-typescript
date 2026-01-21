import { createAuthHeaders } from '../src/auth';

describe('Ed25519 Authentication', () => {
  // Test key pair (DO NOT use in production)
  const testSecretKey = 'nWGxne/9WmC6hEr0kuwsxERJxWl7MmkZcDusAxyuf2A=';

  test('should create auth headers with correct keys', async () => {
    const headers = await createAuthHeaders(
      'test-key-id',
      testSecretKey,
      'GET',
      '/v1/orders/open',
    );

    expect(headers['X-PM-Access-Key']).toBe('test-key-id');
    expect(headers['X-PM-Timestamp']).toBeDefined();
    expect(headers['X-PM-Signature']).toBeDefined();
  });

  test('should create timestamp as unix milliseconds', async () => {
    const before = Date.now();
    const headers = await createAuthHeaders(
      'test-key-id',
      testSecretKey,
      'GET',
      '/v1/test',
    );
    const after = Date.now();

    const timestamp = parseInt(headers['X-PM-Timestamp'], 10);
    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after);
  });

  test('should create base64 encoded signature', async () => {
    const headers = await createAuthHeaders(
      'test-key-id',
      testSecretKey,
      'POST',
      '/v1/orders',
    );

    // Signature should be base64 encoded
    const signature = headers['X-PM-Signature'];
    expect(() => atob(signature)).not.toThrow();
  });

  test('should produce different signatures for different methods', async () => {
    const getHeaders = await createAuthHeaders(
      'test-key-id',
      testSecretKey,
      'GET',
      '/v1/test',
    );

    const postHeaders = await createAuthHeaders(
      'test-key-id',
      testSecretKey,
      'POST',
      '/v1/test',
    );

    expect(getHeaders['X-PM-Signature']).not.toBe(
      postHeaders['X-PM-Signature'],
    );
  });

  test('should produce different signatures for different paths', async () => {
    const headers1 = await createAuthHeaders(
      'test-key-id',
      testSecretKey,
      'GET',
      '/v1/orders',
    );

    const headers2 = await createAuthHeaders(
      'test-key-id',
      testSecretKey,
      'GET',
      '/v1/portfolio/positions',
    );

    expect(headers1['X-PM-Signature']).not.toBe(headers2['X-PM-Signature']);
  });
});
