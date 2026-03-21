import type { Cluster, MappedBusiness } from './types';

export function toClusterKey(lat: number, lng: number) {
  return `${lat.toFixed(3)}:${lng.toFixed(3)}`;
}

export function getOffsetCoordinate(baseLat: number, baseLng: number, index: number, total: number) {
  if (total <= 1) return { latitude: baseLat, longitude: baseLng };
  const angle = (2 * Math.PI * index) / total;
  const radiusMeters = 24 + Math.floor(index / 8) * 10;
  const dLat = radiusMeters / 111_320;
  const dLng = radiusMeters / (111_320 * Math.cos((baseLat * Math.PI) / 180));
  return {
    latitude: baseLat + dLat * Math.sin(angle),
    longitude: baseLng + dLng * Math.cos(angle),
  };
}

export function buildClusters(mapBusinesses: MappedBusiness[]): Cluster[] {
  const grouped = new Map<string, MappedBusiness[]>();
  mapBusinesses.forEach((business) => {
    const key = toClusterKey(business.lat, business.lng);
    const existing = grouped.get(key);
    if (existing) {
      existing.push(business);
    } else {
      grouped.set(key, [business]);
    }
  });

  return Array.from(grouped.entries()).map(([key, members], index) => {
    const centerLat = members.reduce((sum, member) => sum + member.lat, 0) / members.length;
    const centerLng = members.reduce((sum, member) => sum + member.lng, 0) / members.length;
    return { id: `cluster-${index}-${key}`, key, centerLat, centerLng, members };
  });
}
