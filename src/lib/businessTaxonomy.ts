import { ENV } from './env';

const PLACEHOLDER_ROOT = `${getPublicOrigin()}/businessImagePlaceholders`;

const CANONICAL_SUBCATEGORY_SLUGS = [
  'restaurants',
  'cafes',
  'bars',
  'fast-food',
  'fine-dining',
  'gyms',
  'spas',
  'salons',
  'wellness',
  'nail-salons',
  'education-learning',
  'transport-travel',
  'finance-insurance',
  'plumbers',
  'electricians',
  'legal-services',
  'accommodation',
  'transport',
  'travel-services',
  'hiking',
  'cycling',
  'water-sports',
  'camping',
  'events-festivals',
  'sports-recreation',
  'nightlife',
  'comedy-clubs',
  'cinemas',
  'museums',
  'galleries',
  'theaters',
  'concerts',
  'family-activities',
  'pet-services',
  'childcare',
  'veterinarians',
  'fashion',
  'electronics',
  'home-decor',
  'books',
  'miscellaneous',
] as const;

type CanonicalSubcategorySlug = (typeof CANONICAL_SUBCATEGORY_SLUGS)[number];

const SUBCATEGORY_SLUG_TO_LABEL: Record<CanonicalSubcategorySlug, string> = {
  restaurants: 'Restaurants',
  cafes: 'Cafes & Coffee',
  bars: 'Bars & Pubs',
  'fast-food': 'Fast Food',
  'fine-dining': 'Fine Dining',
  gyms: 'Gyms & Fitness',
  spas: 'Spas',
  salons: 'Hair Salons',
  wellness: 'Wellness Centers',
  'nail-salons': 'Nail Salons',
  'education-learning': 'Education & Learning',
  'transport-travel': 'Transport & Travel',
  'finance-insurance': 'Finance & Insurance',
  plumbers: 'Plumbers',
  electricians: 'Electricians',
  'legal-services': 'Legal Services',
  accommodation: 'Accommodation',
  transport: 'Transport',
  'travel-services': 'Travel Services',
  hiking: 'Hiking',
  cycling: 'Cycling',
  'water-sports': 'Water Sports',
  camping: 'Camping',
  'events-festivals': 'Events & Festivals',
  'sports-recreation': 'Sports & Recreation',
  nightlife: 'Nightlife',
  'comedy-clubs': 'Comedy Clubs',
  cinemas: 'Cinemas',
  museums: 'Museums',
  galleries: 'Art Galleries',
  theaters: 'Theatres',
  concerts: 'Concerts',
  'family-activities': 'Family Activities',
  'pet-services': 'Pet Services',
  childcare: 'Childcare',
  veterinarians: 'Veterinarians',
  fashion: 'Fashion & Clothing',
  electronics: 'Electronics',
  'home-decor': 'Home Decor',
  books: 'Books & Stationery',
  miscellaneous: 'Miscellaneous',
};

const SUBCATEGORY_ALIAS_TO_CANONICAL: Record<string, CanonicalSubcategorySlug> = {
  restaurant: 'restaurants',
  cafe: 'cafes',
  bar: 'bars',
  salon: 'salons',
  gym: 'gyms',
  spa: 'spas',
  museum: 'museums',
  gallery: 'galleries',
  theater: 'theaters',
  theatre: 'theaters',
  theatres: 'theaters',
  concert: 'concerts',
  cinema: 'cinemas',
  bookstore: 'books',
  airport: 'transport',
  airports: 'transport',
  'train-station': 'transport',
  'train-stations': 'transport',
  'bus-station': 'transport',
  'bus-stations': 'transport',
  'car-rental': 'transport',
  'car-rental-businesses': 'transport',
  'campervan-rental': 'transport',
  'campervan-rentals': 'transport',
  'shuttle-service': 'transport',
  'shuttle-services': 'transport',
  'chauffeur-service': 'transport',
  'chauffeur-services': 'transport',
  'travel-service': 'travel-services',
  'tour-guide': 'travel-services',
  'tour-guides': 'travel-services',
  'travel-agency': 'travel-services',
  'travel-agencies': 'travel-services',
  'luggage-shop': 'travel-services',
  'luggage-shops': 'travel-services',
  'travel-insurance-provider': 'travel-services',
  'travel-insurance-providers': 'travel-services',
};

const INTEREST_LABELS: Record<string, string> = {
  'food-drink': 'Food & Drink',
  'beauty-wellness': 'Beauty & Wellness',
  'professional-services': 'Professional Services',
  travel: 'Travel',
  'outdoors-adventure': 'Outdoors & Adventure',
  'experiences-entertainment': 'Entertainment & Experiences',
  'arts-culture': 'Arts & Culture',
  'family-pets': 'Family & Pets',
  'shopping-lifestyle': 'Shopping & Lifestyle',
  miscellaneous: 'Miscellaneous',
};

const INTEREST_TO_DEFAULT_SUBCATEGORY: Record<string, CanonicalSubcategorySlug> = {
  'food-drink': 'restaurants',
  'beauty-wellness': 'salons',
  'professional-services': 'finance-insurance',
  travel: 'accommodation',
  'outdoors-adventure': 'hiking',
  'experiences-entertainment': 'events-festivals',
  'arts-culture': 'museums',
  'family-pets': 'family-activities',
  'shopping-lifestyle': 'fashion',
  miscellaneous: 'miscellaneous',
};

const SUBCATEGORY_PLACEHOLDER_MAP: Record<CanonicalSubcategorySlug, string> = {
  restaurants: `${PLACEHOLDER_ROOT}/food-drink/restaurants.jpg`,
  cafes: `${PLACEHOLDER_ROOT}/food-drink/cafes-coffee.jpg`,
  bars: `${PLACEHOLDER_ROOT}/food-drink/bars-pubs.jpg`,
  'fast-food': `${PLACEHOLDER_ROOT}/food-drink/fast-food.jpg`,
  'fine-dining': `${PLACEHOLDER_ROOT}/food-drink/fine-dining.jpg`,
  gyms: `${PLACEHOLDER_ROOT}/beauty-wellness/gyms-fitness.jpg`,
  spas: `${PLACEHOLDER_ROOT}/beauty-wellness/spas.jpg`,
  salons: `${PLACEHOLDER_ROOT}/beauty-wellness/hair-salons.jpg`,
  wellness: `${PLACEHOLDER_ROOT}/beauty-wellness/wellness-centers.jpg`,
  'nail-salons': `${PLACEHOLDER_ROOT}/beauty-wellness/nail-salons.jpg`,
  'education-learning': `${PLACEHOLDER_ROOT}/professional-services/education-learning.jpg`,
  'transport-travel': `${PLACEHOLDER_ROOT}/travel/travel.jpg`,
  'finance-insurance': `${PLACEHOLDER_ROOT}/professional-services/finance-insurance.jpg`,
  plumbers: `${PLACEHOLDER_ROOT}/professional-services/plumbers.jpg`,
  electricians: `${PLACEHOLDER_ROOT}/professional-services/electricians.jpg`,
  'legal-services': `${PLACEHOLDER_ROOT}/professional-services/legal-services.jpg`,
  accommodation: `${PLACEHOLDER_ROOT}/travel/travel.jpg`,
  transport: `${PLACEHOLDER_ROOT}/travel/travel.jpg`,
  'travel-services': `${PLACEHOLDER_ROOT}/travel/travel.jpg`,
  hiking: `${PLACEHOLDER_ROOT}/outdoors-adventure/hiking.jpg`,
  cycling: `${PLACEHOLDER_ROOT}/outdoors-adventure/cycling.jpg`,
  'water-sports': `${PLACEHOLDER_ROOT}/outdoors-adventure/water-sports.jpg`,
  camping: `${PLACEHOLDER_ROOT}/outdoors-adventure/camping.jpg`,
  'events-festivals': `${PLACEHOLDER_ROOT}/entertainment-experiences/events-festivals.jpg`,
  'sports-recreation': `${PLACEHOLDER_ROOT}/entertainment-experiences/sports-recreation.jpg`,
  nightlife: `${PLACEHOLDER_ROOT}/entertainment-experiences/nightlife.jpg`,
  'comedy-clubs': `${PLACEHOLDER_ROOT}/entertainment-experiences/comedy-clubs.jpg`,
  cinemas: `${PLACEHOLDER_ROOT}/entertainment-experiences/cinemas.jpg`,
  museums: `${PLACEHOLDER_ROOT}/arts-culture/museums.jpg`,
  galleries: `${PLACEHOLDER_ROOT}/arts-culture/art-galleries.jpg`,
  theaters: `${PLACEHOLDER_ROOT}/arts-culture/theatres.jpg`,
  concerts: `${PLACEHOLDER_ROOT}/arts-culture/concerts.jpg`,
  'family-activities': `${PLACEHOLDER_ROOT}/family-pets/family-activities.jpg`,
  'pet-services': `${PLACEHOLDER_ROOT}/family-pets/pet-services.jpg`,
  childcare: `${PLACEHOLDER_ROOT}/family-pets/childcare.jpg`,
  veterinarians: `${PLACEHOLDER_ROOT}/family-pets/veterinarians.jpg`,
  fashion: `${PLACEHOLDER_ROOT}/shopping-lifestyle/fashion-clothing.jpg`,
  electronics: `${PLACEHOLDER_ROOT}/shopping-lifestyle/electronics.jpg`,
  'home-decor': `${PLACEHOLDER_ROOT}/shopping-lifestyle/home-decor.jpg`,
  books: `${PLACEHOLDER_ROOT}/shopping-lifestyle/books-media.jpg`,
  miscellaneous: `${PLACEHOLDER_ROOT}/miscellaneous/miscellaneous.jpeg`,
};

const DEFAULT_PLACEHOLDER = SUBCATEGORY_PLACEHOLDER_MAP.miscellaneous;

const PLACEHOLDER_SLUG_KEYS = [
  'sub_interest_id',
  'subInterestId',
  'category',
  'interest_id',
  'interestId',
] as const;

const CANONICAL_SLUG_SET = new Set<string>(CANONICAL_SUBCATEGORY_SLUGS);

const SUBCATEGORY_LABEL_TO_SLUG: Record<string, CanonicalSubcategorySlug> = Object.fromEntries(
  Object.entries(SUBCATEGORY_SLUG_TO_LABEL).map(([slug, label]) => [label.trim().toLowerCase(), slug])
) as Record<string, CanonicalSubcategorySlug>;

const INTEREST_LABEL_TO_ID: Record<string, string> = Object.fromEntries(
  Object.entries(INTEREST_LABELS).map(([id, label]) => [label.trim().toLowerCase(), id])
);

type TaxonomyBusiness = {
  sub_interest_id?: string | null;
  subInterestId?: string | null;
  category?: string | null;
  category_label?: string | null;
  subInterestLabel?: string | null;
  interest_id?: string | null;
  interestId?: string | null;
};

function getPublicOrigin() {
  try {
    const url = new URL(ENV.apiBaseUrl);
    if (url.hostname === 'sayso.co.za') {
      url.hostname = 'www.sayso.co.za';
    }
    return url.origin;
  } catch {
    return 'https://www.sayso.co.za';
  }
}

function normalizeCanonicalSubcategory(raw: string | undefined | null): CanonicalSubcategorySlug | null {
  if (!raw || typeof raw !== 'string') return null;
  const key = raw.trim().toLowerCase();
  if (!key) return null;
  if (CANONICAL_SLUG_SET.has(key)) return key as CanonicalSubcategorySlug;

  const alias = SUBCATEGORY_ALIAS_TO_CANONICAL[key];
  if (alias) return alias;

  const fromLabel = SUBCATEGORY_LABEL_TO_SLUG[key];
  if (fromLabel) return fromLabel;

  const fromInterest = INTEREST_TO_DEFAULT_SUBCATEGORY[key];
  if (fromInterest) return fromInterest;

  const interestId = INTEREST_LABEL_TO_ID[key];
  if (interestId) return INTEREST_TO_DEFAULT_SUBCATEGORY[interestId] ?? null;

  return null;
}

export function getCategorySlugFromBusiness(business: TaxonomyBusiness | undefined | null) {
  if (!business) return '';

  for (const key of PLACEHOLDER_SLUG_KEYS) {
    const value = business[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim().toLowerCase();
    }
  }

  return '';
}

export function getCategoryLabelFromBusiness(business: TaxonomyBusiness | undefined | null) {
  const explicitLabel = business?.category_label ?? business?.subInterestLabel;
  if (typeof explicitLabel === 'string' && explicitLabel.trim().length > 0) {
    return explicitLabel.trim();
  }

  const slug = getCategorySlugFromBusiness(business);
  if (!slug) return 'Miscellaneous';

  return (
    SUBCATEGORY_SLUG_TO_LABEL[normalizeCanonicalSubcategory(slug) ?? 'miscellaneous'] ??
    INTEREST_LABELS[slug] ??
    'Miscellaneous'
  );
}

export function getSubcategoryPlaceholderFromCandidates(candidates: ReadonlyArray<string | undefined | null>) {
  for (const candidate of candidates) {
    const canonical = normalizeCanonicalSubcategory(candidate);
    if (canonical) {
      return SUBCATEGORY_PLACEHOLDER_MAP[canonical];
    }
  }

  return DEFAULT_PLACEHOLDER;
}

export function getPlaceholderImageForBusiness(business: TaxonomyBusiness | undefined | null) {
  return getSubcategoryPlaceholderFromCandidates([
    business?.sub_interest_id,
    business?.subInterestId,
    business?.category,
    business?.interest_id,
    business?.interestId,
  ]);
}

export function isPlaceholderImage(imageUrl: string | undefined | null) {
  if (!imageUrl || typeof imageUrl !== 'string') return false;

  return (
    imageUrl.includes('/businessImagePlaceholders/') ||
    imageUrl.includes('/png/') ||
    imageUrl.endsWith('.png')
  );
}
