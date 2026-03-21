import { ReviewConfettiOverlay, ReviewStatusFeedback } from '../components';
import type { FeedbackNotice } from '../types';

type Props = {
  notificationNotice: FeedbackNotice | null;
  showSuccessConfetti: boolean;
  toastNotice: FeedbackNotice | null;
};

export function FeedbackSection({ notificationNotice, showSuccessConfetti, toastNotice }: Props) {
  return (
    <>
      <ReviewConfettiOverlay visible={showSuccessConfetti} />
      <ReviewStatusFeedback notificationNotice={notificationNotice} toastNotice={toastNotice} />
    </>
  );
}
