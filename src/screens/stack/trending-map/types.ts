import type { BusinessListItemDto } from '@sayso/contracts';

export type MappedBusiness = BusinessListItemDto & { lat: number; lng: number };

export type Cluster = {
  id: string;
  key: string;
  centerLat: number;
  centerLng: number;
  members: MappedBusiness[];
};
