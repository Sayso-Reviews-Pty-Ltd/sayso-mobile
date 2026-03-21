import { useState } from 'react';
import { track } from '../lib/telemetry';

type UseFeedbackPulse = {
  shouldShow: boolean;
  show: () => void;
  dismiss: () => void;
  respond: (positive: boolean) => void;
};

/**
 * Manages in-product feedback pulse visibility for a given context.
 * Throttling is in-memory only (resets on app restart).
 * Persist the last-shown timestamp via AsyncStorage when ready for production throttling.
 */
export function useFeedbackPulse(context: string): UseFeedbackPulse {
  const [shouldShow, setShouldShow] = useState(false);

  const show = () => setShouldShow(true);

  const dismiss = () => setShouldShow(false);

  const respond = (positive: boolean) => {
    track('feedback.pulse_responded', { sentiment: positive ? 'positive' : 'negative', context });
    dismiss();
  };

  return { shouldShow, show, dismiss, respond };
}
