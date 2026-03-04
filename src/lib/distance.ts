export function calculateDistanceKm(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
) {
  const earthRadiusKm = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);
  const lat1 = toRadians(fromLat);
  const lat2 = toRadians(toLat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export function formatDistanceAway(distanceKm: number) {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    return '';
  }

  if (distanceKm < 1) {
    const roundedMeters = Math.max(10, Math.round((distanceKm * 1000) / 10) * 10);
    return `${roundedMeters} m away`;
  }

  return `${distanceKm.toFixed(1)} km away`;
}
