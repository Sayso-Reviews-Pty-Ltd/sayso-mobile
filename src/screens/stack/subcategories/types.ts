import type { SharedValue } from 'react-native-reanimated';

export type Subcategory = { id: string; label: string };

export type SubcategoryGroupDefinition = {
  groupLabel: string;
  items: Subcategory[];
};

export type VisibleSubcategoryGroup = {
  interestId: string;
  groupLabel: string;
  items: Subcategory[];
};

export type PreferenceDto = { id: string };

export type PreferencesResponseDto = {
  interests?: PreferenceDto[];
  subcategories?: PreferenceDto[];
};

export type GroupMutables = {
  opacity: SharedValue<number>;
  y: SharedValue<number>;
  titleX: SharedValue<number>;
};

export type PillMutables = {
  opacity: SharedValue<number>;
  entryScale: SharedValue<number>;
  selectedScale: SharedValue<number>;
  x: SharedValue<number>;
  y: SharedValue<number>;
  tapScale: SharedValue<number>;
  checkScale: SharedValue<number>;
};
