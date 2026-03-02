import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export interface BusinessDetail {
  id: string;
  name: string;
  category_label?: string;
  category?: string;
  location?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  image_url?: string;
  verified?: boolean;
  rating?: number;
  reviews?: number;
  lat?: number;
  lng?: number;
  slug?: string;
  priceRange?: string;
  badge?: string;
  hours?: Record<string, string>;
  images?: { url: string; alt?: string }[];
}

export function useBusinessDetail(id: string) {
  return useQuery({
    queryKey: ['business', id],
    queryFn: () => apiFetch<BusinessDetail>(`/api/businesses/${id}`),
    enabled: !!id,
    staleTime: 60_000,
  });
}
