import type { BadgeMappingItem } from './types';

export const EXPLORER_BADGES: Record<string, BadgeMappingItem> = {
  explorer_dabbler: {
    id: 'explorer_dabbler',
    name: 'The Dabbler',
    description: 'Dipping your toes into the community.',
    howToEarn: 'Write your first review.',
    ionicon: 'compass-outline',
    imageKey: '011',
    badgeGroup: 'explorer',
  },
  explorer_newbie_nomad: {
    id: 'explorer_newbie_nomad',
    name: 'Newbie Nomad',
    description: 'Starting to explore different categories.',
    howToEarn: 'Review businesses in 3 different categories.',
    ionicon: 'search-outline',
    imageKey: '036',
    badgeGroup: 'explorer',
  },
  explorer_curiosity_captain: {
    id: 'explorer_curiosity_captain',
    name: 'Curiosity Captain',
    description: 'Actively broadening your horizons.',
    howToEarn: 'Review businesses in 5 different categories.',
    ionicon: 'boat-outline',
    imageKey: '044',
    badgeGroup: 'explorer',
  },
  explorer_variety_voyager: {
    id: 'explorer_variety_voyager',
    name: 'Variety Voyager',
    description: "A true explorer of the city's offerings.",
    howToEarn: 'Review businesses in 8 different categories.',
    ionicon: 'globe-outline',
    imageKey: '045',
    badgeGroup: 'explorer',
  },
  explorer_full_circle: {
    id: 'explorer_full_circle',
    name: 'Full Circle',
    description: "You've seen it all.",
    howToEarn: 'Review businesses in all available categories.',
    ionicon: 'ellipse-outline',
    imageKey: '046',
    badgeGroup: 'explorer',
  },
};
