import { EmptyState } from '../../../components/EmptyState';

type Props = {
  onBack: () => void;
};

export function ReviewerErrorState({ onBack }: Props) {
  return (
    <EmptyState
      icon="person-outline"
      title="Reviewer not found"
      message="This profile may have been removed or is unavailable."
      actionLabel="Go back"
      onAction={onBack}
    />
  );
}
