export function normalizeInterestId(id?: string | null): string {
  if (!id || id === 'uncategorized') return 'miscellaneous';
  return id;
}
