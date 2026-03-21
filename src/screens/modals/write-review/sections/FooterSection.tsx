import { ShareMomentSheet } from '../../../../components/ShareMomentSheet';
import { ImagePreviewOverlay } from '../components';

type Props = {
  onClosePreview: () => void;
  onCloseShareMoment: () => void;
  previewUri: string | null;
  showShareMoment: boolean;
};

export function FooterSection({
  onClosePreview,
  onCloseShareMoment,
  previewUri,
  showShareMoment,
}: Props) {
  return (
    <>
      <ImagePreviewOverlay previewUri={previewUri} onClose={onClosePreview} />
      <ShareMomentSheet
        visible={showShareMoment}
        onClose={onCloseShareMoment}
        moment={{
          type: 'review_posted',
          title: 'Review posted!',
          subtitle: 'Your voice helps the community.',
          icon: 'star',
          color: '#722F37',
        }}
      />
    </>
  );
}
