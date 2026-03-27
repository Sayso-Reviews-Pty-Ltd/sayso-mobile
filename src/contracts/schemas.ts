/**
 * Zod runtime schemas for critical API response shapes.
 *
 * Purpose: catch schema drift between the API and the client at runtime,
 * before bad data reaches components. Validation is always non-throwing —
 * failures are logged as warnings and the original payload is passed through
 * so the app degrades gracefully rather than crashing.
 *
 * Keep schemas in sync with the TypeScript interfaces in index.ts.
 */
import { z } from 'zod';

// ── Primitives ─────────────────────────────────────────────────────────────

const optionalString = z.string().nullish();
const optionalNumber = z.number().nullish();
const optionalBoolean = z.boolean().nullish();

// ── API envelope ───────────────────────────────────────────────────────────

export const ApiErrorSchema = z.object({
  message: z.string(),
  code: optionalString,
});

export function apiEnvelopeSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    data: dataSchema.nullable(),
    error: ApiErrorSchema.nullable(),
  });
}

// ── Profile ────────────────────────────────────────────────────────────────

export const ProfileSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'business_owner', 'admin', 'both']).optional(),
  account_role: z.enum(['user', 'business_owner', 'admin']).optional(),
  username: optionalString,
  display_name: optionalString,
  avatar_url: optionalString,
  onboarding_step: optionalString,
  onboarding_complete: optionalBoolean,
  email: optionalString,
  review_count: optionalNumber,
  badge_count: optionalNumber,
  reviews_count: optionalNumber,
  badges_count: optionalNumber,
  interests_count: optionalNumber,
  is_top_reviewer: optionalBoolean,
  bio: optionalString,
  location: optionalString,
  website_url: optionalString,
  created_at: optionalString,
  updated_at: optionalString,
});

export const ProfileResponseSchema = apiEnvelopeSchema(ProfileSchema);

export type ProfileSchemaType = z.infer<typeof ProfileSchema>;

// ── Business (raw API shape) ───────────────────────────────────────────────

export const RawBusinessDetailSchema = z.object({
  id: optionalString,
  name: optionalString,
  category_label: optionalString,
  category: optionalString,
  primary_category_label: optionalString,
  primary_category_slug: optionalString,
  primary_subcategory_slug: optionalString,
  location: optionalString,
  address: optionalString,
  phone: optionalString,
  email: optionalString,
  website: optionalString,
  description: z.union([
    z.string(),
    z.object({ raw: optionalString, friendly: optionalString }),
    z.null(),
  ]).optional(),
  image_url: optionalString,
  image: optionalString,
  verified: optionalBoolean,
  rating: optionalNumber,
  reviews: optionalNumber,
  lat: optionalNumber,
  lng: optionalNumber,
  latitude: optionalNumber,
  longitude: optionalNumber,
  slug: optionalString,
  badge: optionalString,
  owner_id: optionalString,
  interest_id: optionalString,
  sub_interest_id: optionalString,
  stats: z.object({
    average_rating: optionalNumber,
    total_reviews: optionalNumber,
  }).optional(),
});

export type RawBusinessDetailSchemaType = z.infer<typeof RawBusinessDetailSchema>;

// ── Review ─────────────────────────────────────────────────────────────────

export const ReviewSchema = z.object({
  id: z.string(),
  business_id: z.string(),
  user_id: z.string(),
  rating: z.number().min(1).max(5),
  content: optionalString,
  created_at: z.string(),
  updated_at: optionalString,
  helpful_count: optionalNumber,
});

export type ReviewSchemaType = z.infer<typeof ReviewSchema>;

// ── Notification ───────────────────────────────────────────────────────────

export const NotificationSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  link: optionalString,
  image: optionalString,
  image_alt: optionalString,
  read: z.boolean(),
  read_at: optionalString,
  created_at: z.string(),
  updated_at: optionalString,
});

export type NotificationSchemaType = z.infer<typeof NotificationSchema>;
