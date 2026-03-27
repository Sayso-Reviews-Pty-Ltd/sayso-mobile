/**
 * Runtime validation helper using Zod.
 *
 * Always non-throwing: on schema mismatch, logs a warning in dev and returns
 * the original data so the app degrades gracefully rather than crashing.
 */
import { z } from 'zod';

/**
 * Validate `data` against `schema`.
 *
 * - Returns typed data on success.
 * - On failure: warns in dev, returns the raw data cast to the expected type
 *   so callers always get a usable value.
 */
export function safeValidate<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  label?: string,
): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    if (__DEV__) {
      const prefix = label ? `[validate:${label}]` : '[validate]';
      console.warn(
        `${prefix} Schema mismatch — app will use raw data. Fix the API or update the schema.`,
        result.error.issues,
      );
    }
    // Graceful degradation: pass through the original data even if invalid.
    return data as z.infer<T>;
  }

  return result.data;
}
