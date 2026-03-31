describe('ENV.homeNativeCarouselEnabled', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      EXPO_PUBLIC_API_BASE_URL: 'https://www.sayso.co.za',
      EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
    };
    delete process.env.EXPO_PUBLIC_HOME_NATIVE_CAROUSEL_ENABLED;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('defaults to false when env var is missing', () => {
    const { ENV } = require('../../lib/env');
    expect(ENV.homeNativeCarouselEnabled).toBe(false);
  });

  it('parses truthy values', () => {
    process.env.EXPO_PUBLIC_HOME_NATIVE_CAROUSEL_ENABLED = 'true';
    const { ENV } = require('../../lib/env');
    expect(ENV.homeNativeCarouselEnabled).toBe(true);
  });

  it('parses falsy values', () => {
    process.env.EXPO_PUBLIC_HOME_NATIVE_CAROUSEL_ENABLED = 'off';
    const { ENV } = require('../../lib/env');
    expect(ENV.homeNativeCarouselEnabled).toBe(false);
  });
});
