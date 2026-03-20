import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../../components/Typography';
import { FeedbackNotice } from '../types';

type Props = {
  notificationNotice: FeedbackNotice | null;
  toastNotice: FeedbackNotice | null;
};

export function ReviewStatusFeedback({ notificationNotice, toastNotice }: Props) {
  return (
    <>
      {notificationNotice ? (
        <View
          pointerEvents="none"
          style={[
            styles.reviewStatusNotice,
            notificationNotice.variant === 'success'
              ? styles.reviewStatusNoticeSuccess
              : notificationNotice.variant === 'warning'
                ? styles.reviewStatusNoticeWarning
                : styles.reviewStatusNoticeError,
          ]}
        >
          <Ionicons
            name={
              notificationNotice.variant === 'success'
                ? 'checkmark-circle-outline'
                : notificationNotice.variant === 'warning'
                  ? 'warning-outline'
                  : 'alert-circle-outline'
            }
            size={16}
            color={
              notificationNotice.variant === 'success'
                ? '#1F5133'
                : notificationNotice.variant === 'warning'
                  ? '#6B3F1D'
                  : '#722F37'
            }
          />
          <Text style={styles.reviewStatusNoticeTitle}>{notificationNotice.title}</Text>
        </View>
      ) : null}
      {toastNotice ? (
        <View
          pointerEvents="none"
          style={[
            styles.reviewStatusToast,
            toastNotice.variant === 'success'
              ? styles.reviewStatusToastSuccess
              : toastNotice.variant === 'warning'
                ? styles.reviewStatusToastWarning
                : styles.reviewStatusToastError,
          ]}
        >
          <Text
            style={[
              styles.reviewStatusToastTitle,
              toastNotice.variant === 'success'
                ? styles.reviewStatusToastTitleSuccess
                : toastNotice.variant === 'warning'
                  ? styles.reviewStatusToastTitleWarning
                  : styles.reviewStatusToastTitleError,
            ]}
          >
            {toastNotice.title}
          </Text>
          <Text
            style={[
              styles.reviewStatusToastMessage,
              toastNotice.variant === 'success'
                ? styles.reviewStatusToastMessageSuccess
                : toastNotice.variant === 'warning'
                  ? styles.reviewStatusToastMessageWarning
                  : styles.reviewStatusToastMessageError,
            ]}
          >
            {toastNotice.message}
          </Text>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  reviewStatusNotice: {
    position: 'absolute',
    top: 12,
    left: 14,
    right: 14,
    zIndex: 70,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewStatusNoticeSuccess: {
    backgroundColor: 'rgba(157,171,155,0.96)',
    borderColor: 'rgba(31,81,51,0.25)',
  },
  reviewStatusNoticeWarning: {
    backgroundColor: 'rgba(255,209,102,0.95)',
    borderColor: 'rgba(212,145,92,0.34)',
  },
  reviewStatusNoticeError: {
    backgroundColor: 'rgba(229,224,229,0.98)',
    borderColor: 'rgba(114,47,55,0.26)',
  },
  reviewStatusNoticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  reviewStatusToast: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 18,
    zIndex: 70,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  reviewStatusToastSuccess: {
    backgroundColor: 'rgba(157,171,155,0.98)',
    borderColor: 'rgba(31,81,51,0.30)',
  },
  reviewStatusToastWarning: {
    backgroundColor: 'rgba(255,209,102,0.96)',
    borderColor: 'rgba(212,145,92,0.34)',
  },
  reviewStatusToastError: {
    backgroundColor: 'rgba(114,47,55,0.95)',
    borderColor: 'rgba(255,255,255,0.16)',
  },
  reviewStatusToastTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  reviewStatusToastTitleSuccess: { color: '#1F5133' },
  reviewStatusToastTitleWarning: { color: '#6B3F1D' },
  reviewStatusToastTitleError: { color: '#FFFFFF' },
  reviewStatusToastMessage: {
    fontSize: 12,
    lineHeight: 17,
  },
  reviewStatusToastMessageSuccess: { color: 'rgba(45,45,45,0.86)' },
  reviewStatusToastMessageWarning: { color: 'rgba(45,45,45,0.86)' },
  reviewStatusToastMessageError: { color: 'rgba(255,255,255,0.92)' },
});
