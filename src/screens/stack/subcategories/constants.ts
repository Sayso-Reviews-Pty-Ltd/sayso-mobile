import type { SubcategoryGroupDefinition } from './types';

export const MIN = 1;
export const MAX = 10;

export const SUBCATEGORY_MAP: Record<string, SubcategoryGroupDefinition> = {
  'food-drink': {
    groupLabel: 'Food & Drink',
    items: [
      { id: 'restaurants', label: 'Restaurants' },
      { id: 'cafes', label: 'Cafés & Coffee' },
      { id: 'bars', label: 'Bars & Pubs' },
      { id: 'fast-food', label: 'Fast Food' },
      { id: 'fine-dining', label: 'Fine Dining' },
    ],
  },
  'beauty-wellness': {
    groupLabel: 'Beauty & Wellness',
    items: [
      { id: 'gyms', label: 'Gyms & Fitness' },
      { id: 'spas', label: 'Spas' },
      { id: 'salons', label: 'Hair Salons' },
      { id: 'wellness', label: 'Wellness Centers' },
      { id: 'nail-salons', label: 'Nail Salons' },
    ],
  },
  'professional-services': {
    groupLabel: 'Professional Services',
    items: [
      { id: 'education-learning', label: 'Education & Learning' },
      { id: 'transport-travel', label: 'Transport & Travel' },
      { id: 'finance-insurance', label: 'Finance & Insurance' },
      { id: 'plumbers', label: 'Plumbers' },
      { id: 'electricians', label: 'Electricians' },
      { id: 'legal-services', label: 'Legal Services' },
    ],
  },
  travel: {
    groupLabel: 'Travel',
    items: [
      { id: 'accommodation', label: 'Accommodation' },
      { id: 'transport', label: 'Transport' },
      { id: 'travel-services', label: 'Travel Services' },
    ],
  },
  'outdoors-adventure': {
    groupLabel: 'Outdoors & Adventure',
    items: [
      { id: 'hiking', label: 'Hiking' },
      { id: 'cycling', label: 'Cycling' },
      { id: 'water-sports', label: 'Water Sports' },
      { id: 'camping', label: 'Camping' },
    ],
  },
  'experiences-entertainment': {
    groupLabel: 'Entertainment & Experiences',
    items: [
      { id: 'events-festivals', label: 'Events & Festivals' },
      { id: 'sports-recreation', label: 'Sports & Recreation' },
      { id: 'nightlife', label: 'Nightlife' },
      { id: 'comedy-clubs', label: 'Comedy Clubs' },
      { id: 'cinemas', label: 'Cinemas' },
    ],
  },
  'arts-culture': {
    groupLabel: 'Arts & Culture',
    items: [
      { id: 'museums', label: 'Museums' },
      { id: 'galleries', label: 'Art Galleries' },
      { id: 'theaters', label: 'Theaters' },
      { id: 'concerts', label: 'Concerts' },
    ],
  },
  'family-pets': {
    groupLabel: 'Family & Pets',
    items: [
      { id: 'family-activities', label: 'Family Activities' },
      { id: 'pet-services', label: 'Pet Services' },
      { id: 'childcare', label: 'Childcare' },
      { id: 'veterinarians', label: 'Veterinarians' },
    ],
  },
  'shopping-lifestyle': {
    groupLabel: 'Shopping & Lifestyle',
    items: [
      { id: 'fashion', label: 'Fashion & Clothing' },
      { id: 'electronics', label: 'Electronics' },
      { id: 'home-decor', label: 'Home Decor' },
      { id: 'books', label: 'Books & Media' },
    ],
  },
};

export const MAX_GROUPS = Object.keys(SUBCATEGORY_MAP).length;
