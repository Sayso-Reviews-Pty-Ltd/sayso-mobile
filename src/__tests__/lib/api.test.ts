import { ApiError, apiFetch } from '../../lib/api';
import { getOrCreateAnonymousId } from '../../lib/anonymousClient';
import { supabase } from '../../lib/supabase';

jest.mock('../../lib/env', () => ({
  ENV: { apiBaseUrl: 'https://api.test' },
}));

jest.mock('../../lib/supabase', () => ({
  supabase: { auth: { getSession: jest.fn() } },
}));

jest.mock('../../lib/anonymousClient', () => ({
  getOrCreateAnonymousId: jest.fn().mockResolvedValue('anon-id-123'),
}));

// Mock react-native-url-polyfill (side-effect import in supabase.ts)
jest.mock('react-native-url-polyfill/auto', () => {});

const mockGetSession = (supabase.auth.getSession as jest.Mock);
const mockGetOrCreateAnonymousId = (getOrCreateAnonymousId as jest.Mock);
const mockFetch = jest.fn();
const originalWindow = (global as any).window;

beforeAll(() => {
  (global as any).fetch = mockFetch;
});

afterAll(() => {
  (global as any).window = originalWindow;
});

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makeOkResponse(body: unknown, status = 200): Response {
  const json = JSON.stringify(body);
  return {
    ok: true,
    status,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: () => Promise.resolve(JSON.parse(json)),
    text: () => Promise.resolve(json),
  } as unknown as Response;
}

function makeErrorResponse(
  status: number,
  body: unknown = {},
  extraHeaders: Record<string, string> = {}
): Response {
  const json = JSON.stringify(body);
  return {
    ok: false,
    status,
    headers: new Headers({ 'content-type': 'application/json', ...extraHeaders }),
    json: () => Promise.resolve(JSON.parse(json)),
    text: () => Promise.resolve(json),
  } as unknown as Response;
}

// ─── ApiError class ────────────────────────────────────────────────────────────

describe('ApiError', () => {
  it('has name "ApiError"', () => {
    const err = new ApiError({ status: 404, code: 'NOT_FOUND', message: 'Not found' });
    expect(err.name).toBe('ApiError');
  });

  it('stores status, code, and message', () => {
    const err = new ApiError({ status: 404, code: 'NOT_FOUND', message: 'Not found' });
    expect(err.status).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('Not found');
  });

  it('stores requestId when provided', () => {
    const err = new ApiError({ status: 500, code: 'ERR', message: 'Oops', requestId: 'req-abc' });
    expect(err.requestId).toBe('req-abc');
  });

  it('defaults requestId to null when not provided', () => {
    const err = new ApiError({ status: 400, code: 'ERR', message: 'Bad' });
    expect(err.requestId).toBeNull();
  });

  it('defaults retriable to false', () => {
    const err = new ApiError({ status: 400, code: 'ERR', message: 'Bad' });
    expect(err.retriable).toBe(false);
  });

  it('stores retriable as true when provided', () => {
    const err = new ApiError({ status: 500, code: 'ERR', message: 'Oops', retriable: true });
    expect(err.retriable).toBe(true);
  });

  it('is an instance of Error', () => {
    const err = new ApiError({ status: 500, code: 'ERR', message: 'Oops' });
    expect(err).toBeInstanceOf(Error);
  });
});

// ─── Successful responses ──────────────────────────────────────────────────────

describe('apiFetch — successful responses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null } });
    (global as any).window = originalWindow;
  });

  it('resolves with parsed JSON body on 200', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({ id: 'biz-1', name: 'Cafe Luna' }));
    const result = await apiFetch<{ id: string; name: string }>('/api/businesses/biz-1');
    expect(result).toEqual({ id: 'biz-1', name: 'Cafe Luna' });
  });

  it('prefixes URL with apiBaseUrl', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({}));
    await apiFetch('/api/test');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.test/api/test',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('resolves with null on 204 No Content', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      headers: new Headers({}),
    } as unknown as Response);
    const result = await apiFetch('/api/resource', { method: 'DELETE' });
    expect(result).toBeNull();
  });

  it('adds Authorization: Bearer when session has access_token', async () => {
    mockGetSession.mockResolvedValueOnce({
      data: { session: { access_token: 'tok-abc' } },
    });
    mockFetch.mockResolvedValueOnce(makeOkResponse({}));

    await apiFetch('/api/me');

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit & { headers: Headers }];
    expect(init.headers.get('Authorization')).toBe('Bearer tok-abc');
  });

  it('does not set Authorization header when no session', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({}));
    await apiFetch('/api/public');

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit & { headers: Headers }];
    expect(init.headers.get('Authorization')).toBeNull();
  });

  it('sets x-anonymous-id header when missing auth and includeAnonymousIdOnMissingAuth is true', async () => {
    (global as any).window = undefined;
    mockFetch.mockResolvedValueOnce(makeOkResponse({}));

    await apiFetch('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ rating: 5 }),
      includeAnonymousIdOnMissingAuth: true,
    });

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit & { headers: Headers }];
    expect(init.headers.get('x-anonymous-id')).toBe('anon-id-123');
    expect(mockGetOrCreateAnonymousId).toHaveBeenCalledTimes(1);
  });

  it('skips x-anonymous-id on cross-origin web requests to avoid CORS preflight failure', async () => {
    (global as any).window = { location: { origin: 'http://localhost:8081' } };
    mockFetch.mockResolvedValueOnce(makeOkResponse({}));

    await apiFetch('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ rating: 5 }),
      includeAnonymousIdOnMissingAuth: true,
    });

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit & { headers: Headers }];
    expect(init.headers.get('x-anonymous-id')).toBeNull();
    expect(mockGetOrCreateAnonymousId).not.toHaveBeenCalled();
  });

  it('keeps x-anonymous-id on same-origin web requests', async () => {
    (global as any).window = { location: { origin: 'https://api.test' } };
    mockFetch.mockResolvedValueOnce(makeOkResponse({}));

    await apiFetch('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ rating: 5 }),
      includeAnonymousIdOnMissingAuth: true,
    });

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit & { headers: Headers }];
    expect(init.headers.get('x-anonymous-id')).toBe('anon-id-123');
    expect(mockGetOrCreateAnonymousId).toHaveBeenCalledTimes(1);
  });

  it('sets Content-Type: application/json for non-FormData string bodies', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({}));
    await apiFetch('/api/endpoint', { method: 'POST', body: JSON.stringify({ foo: 1 }) });

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit & { headers: Headers }];
    expect(init.headers.get('Content-Type')).toBe('application/json');
  });

  it('defaults method to GET when not specified', async () => {
    mockFetch.mockResolvedValueOnce(makeOkResponse({}));
    await apiFetch('/api/endpoint');

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit & { headers: Headers }];
    expect(init.method).toBe('GET');
  });
});

// ─── Error responses ───────────────────────────────────────────────────────────

describe('apiFetch — error responses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null } });
  });

  it('throws ApiError on 404', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(404));
    const err = await apiFetch('/api/missing').catch((e) => e) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(404);
  });

  it('uses safe status message for 401', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(401));
    const err = await apiFetch('/api/secure').catch((e) => e as ApiError) as ApiError;
    expect(err.message).toBe('Your session has expired. Please sign in again.');
  });

  it('uses safe status message for 403', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(403));
    const err = await apiFetch('/api/admin').catch((e) => e as ApiError) as ApiError;
    expect(err.message).toBe('You are not allowed to perform this action.');
  });

  it('uses safe status message for 404', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(404));
    const err = await apiFetch('/api/nothing').catch((e) => e as ApiError) as ApiError;
    expect(err.message).toBe('The requested resource was not found.');
  });

  it('uses safe status message for 429', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(429));
    const err = await apiFetch('/api/throttled').catch((e) => e as ApiError) as ApiError;
    expect(err.message).toBe('Too many requests. Please wait and try again.');
  });

  it('uses safe status message for 500', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(500, {}, { 'x-request-id': 'r1' }));
    const err = await apiFetch('/api/broken', { retryCount: 0 }).catch((e) => e as ApiError) as ApiError;
    expect(err.message).toBe('Server error. Please try again in a moment.');
  });

  it('prefers message from error payload over safe fallback', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(422, { message: 'Email already taken' }));
    const err = await apiFetch('/api/register', { method: 'POST', body: '{}' }).catch(
      (e) => e as ApiError
    ) as ApiError;
    expect(err.message).toBe('Email already taken');
  });

  it('uses nested error.message from payload when present', async () => {
    mockFetch.mockResolvedValueOnce(
      makeErrorResponse(400, { error: { message: 'Invalid field', code: 'INVALID' } })
    );
    const err = await apiFetch('/api/endpoint').catch((e) => e as ApiError) as ApiError;
    expect(err.message).toBe('Invalid field');
    expect(err.code).toBe('INVALID');
  });

  it('uses code from error payload', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(400, { code: 'VALIDATION_ERROR', message: 'Bad input' }));
    const err = await apiFetch('/api/endpoint').catch((e) => e as ApiError) as ApiError;
    expect(err.code).toBe('VALIDATION_ERROR');
  });

  it('defaults code to HTTP_{status} when not in payload', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(418, {}));
    const err = await apiFetch('/api/teapot').catch((e) => e as ApiError) as ApiError;
    expect(err.code).toBe('HTTP_418');
  });

  it('extracts requestId from x-request-id response header', async () => {
    mockFetch.mockResolvedValueOnce(
      makeErrorResponse(500, {}, { 'x-request-id': 'req-xyz' })
    );
    const err = await apiFetch('/api/fail', { retryCount: 0 }).catch((e) => e as ApiError) as ApiError;
    expect(err.requestId).toBe('req-xyz');
  });

  it('extracts requestId from payload.requestId field', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(400, { requestId: 'payload-req-id' }));
    const err = await apiFetch('/api/endpoint').catch((e) => e as ApiError) as ApiError;
    expect(err.requestId).toBe('payload-req-id');
  });

  it('throws ApiError with NETWORK_ERROR on fetch exception', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Network request failed'));
    const err = await apiFetch('/api/endpoint', { retryCount: 0 }).catch((e) => e as ApiError) as ApiError;
    expect(err.code).toBe('NETWORK_ERROR');
    expect(err.status).toBe(0);
    expect(err.message).toContain('Network request failed');
  });
});

// ─── Retry logic ───────────────────────────────────────────────────────────────

describe('apiFetch — retry logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null } });
  });

  it('retries a GET once on 500 and succeeds on second attempt', async () => {
    mockFetch
      .mockResolvedValueOnce(makeErrorResponse(500))
      .mockResolvedValueOnce(makeOkResponse({ ok: true }));

    const result = await apiFetch('/api/endpoint');
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ ok: true });
  }, 5000);

  it('retries a GET on 502 Bad Gateway', async () => {
    mockFetch
      .mockResolvedValueOnce(makeErrorResponse(502))
      .mockResolvedValueOnce(makeOkResponse({ data: 'ok' }));

    const result = await apiFetch('/api/endpoint');
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ data: 'ok' });
  }, 5000);

  it('retries a GET on 503 Service Unavailable', async () => {
    mockFetch
      .mockResolvedValueOnce(makeErrorResponse(503))
      .mockResolvedValueOnce(makeOkResponse({}));

    await apiFetch('/api/endpoint');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  }, 5000);

  it('does NOT retry a GET on 404', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(404));
    await expect(apiFetch('/api/missing')).rejects.toMatchObject({ status: 404 });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry a GET on 401', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(401));
    await expect(apiFetch('/api/secure')).rejects.toMatchObject({ status: 401 });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry a POST on 500', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(500));
    await expect(
      apiFetch('/api/endpoint', { method: 'POST', body: '{}' })
    ).rejects.toMatchObject({ status: 500 });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry a DELETE on 500', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(500));
    await expect(
      apiFetch('/api/endpoint', { method: 'DELETE' })
    ).rejects.toMatchObject({ status: 500 });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry when retryCount is explicitly 0', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(500));
    await expect(apiFetch('/api/endpoint', { retryCount: 0 })).rejects.toMatchObject({
      status: 500,
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('marks 500 GET error as retriable', async () => {
    mockFetch
      .mockResolvedValueOnce(makeErrorResponse(500))
      .mockResolvedValueOnce(makeErrorResponse(500));
    const err = await apiFetch('/api/endpoint', { retryCount: 1 }).catch((e) => e as ApiError) as ApiError;
    expect(err.retriable).toBe(true);
  });

  it('marks 404 error as NOT retriable', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(404));
    const err = await apiFetch('/api/missing').catch((e) => e as ApiError) as ApiError;
    expect(err.retriable).toBe(false);
  });
});
