import { useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../providers/AuthProvider';

export function useReviewHelpful(reviewId: string, initialCount = 0) {
  const { user } = useAuth();
  const [count, setCount] = useState(initialCount);
  const [isHelpful, setIsHelpful] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!user || loading) return;

    const prev = { count, isHelpful };
    const next = isHelpful
      ? { count: Math.max(0, count - 1), isHelpful: false }
      : { count: count + 1, isHelpful: true };

    setCount(next.count);
    setIsHelpful(next.isHelpful);
    setLoading(true);

    try {
      const method = isHelpful ? 'DELETE' : 'POST';
      await apiFetch(`/api/reviews/${reviewId}/helpful`, { method });
    } catch {
      setCount(prev.count);
      setIsHelpful(prev.isHelpful);
    } finally {
      setLoading(false);
    }
  };

  return { count, isHelpful, loading, toggle };
}
