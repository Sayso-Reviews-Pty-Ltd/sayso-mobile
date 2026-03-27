import { RefObject } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { InlineErrorBanner } from '../../../components/InlineErrorBanner';
import {
  EventSpecialActionCard,
  EventSpecialContactInfoCard,
  EventSpecialDescriptionCard,
  EventSpecialDetailsCard,
  EventSpecialHero,
  EventSpecialInfoBlock,
  EventSpecialMoreDatesCard,
  EventSpecialPageHeader,
  type EventSpecialHeaderRightAction,
  EventSpecialRelatedSection,
  EventSpecialReviewsSection,
} from '../../../components/event-detail';
import { NAVBAR_BG_COLOR } from '../../../styles/colors';
import { TransitionItem } from '../../../components/motion/TransitionItem';
import { ScreenTransitionScope } from '../../../components/motion/TransitionScope';
import { routes } from '../../../navigation/routes';
import { styles } from './eventSpecialScreenStyles';
import type { EventSpecialDetail } from '../../../hooks/useEventSpecialDetail';
import type { EventReviewItem } from '../../../hooks/useEventReviews';
import type { useRelatedEventSpecials } from '../../../hooks/useRelatedEventSpecials';
import type { useEventRsvp } from '../../../hooks/useEventRsvp';
import type { useEventReminder } from '../../../hooks/useEventReminder';

type Props = {
  scrollRef: RefObject<ScrollView | null>;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  item: EventSpecialDetail;
  routeType: 'event' | 'special';
  effectiveRating: number;
  id: string;
  showDeferredSections: boolean;
  detailQueryIsError: boolean;
  detailQueryError: string | null | undefined;
  onRefetchDetail: () => void;
  actionError: string | null;
  onDismissActionError: () => void;
  rsvp: ReturnType<typeof useEventRsvp>;
  reminder: ReturnType<typeof useEventReminder>;
  reviews: { reviews: EventReviewItem[]; isLoading: boolean; isFetching?: boolean; isError?: boolean; error: string | null | undefined; refetch: () => unknown };
  related: ReturnType<typeof useRelatedEventSpecials>;
  headerRightActions: EventSpecialHeaderRightAction[];
  onPressBack: () => void;
  onPressGoing: () => void;
  onPressReminder: (option: '1_day' | '2_hours') => void;
  onPressWriteReview: () => void;
};

export function EventSpecialScreenContent({
  scrollRef,
  onScroll,
  item,
  routeType,
  effectiveRating,
  id,
  showDeferredSections,
  detailQueryIsError,
  detailQueryError,
  onRefetchDetail,
  actionError,
  onDismissActionError,
  rsvp,
  reminder,
  reviews,
  related,
  headerRightActions,
  onPressBack,
  onPressGoing,
  onPressReminder,
  onPressWriteReview,
}: Props) {
  const router = useRouter();

  return (
    <>
      <View style={[styles.stickyHeader, { backgroundColor: NAVBAR_BG_COLOR }]}>
        <EventSpecialPageHeader
          onPressBack={onPressBack}
          onPressNotifications={() => router.push(routes.notifications() as never)}
          onPressMessages={() => router.push(routes.dmInbox() as never)}
          rightActions={headerRightActions}
          collapsed={true}
        />
      </View>

      <ScreenTransitionScope>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {detailQueryIsError && item ? (
            <View style={styles.statusBanner}>
              <InlineErrorBanner
                message={`Showing saved details. ${detailQueryError ?? 'Please refresh.'}`}
                actionLabel="Retry"
                onAction={onRefetchDetail}
              />
            </View>
          ) : null}

          {actionError ? (
            <View style={styles.statusBanner}>
              <InlineErrorBanner
                message={actionError}
                actionLabel="Dismiss"
                onAction={onDismissActionError}
              />
            </View>
          ) : null}

          <View style={styles.mainColumn}>
            <TransitionItem role="hero" index={0}>
              <EventSpecialHero item={item} rating={effectiveRating} />
            </TransitionItem>

            <TransitionItem role="subheading" index={1}>
              <EventSpecialInfoBlock
                title={item.title}
                rating={effectiveRating}
                location={item.location}
                type={item.type}
              />
            </TransitionItem>

            <TransitionItem role="support" index={2}>
              <EventSpecialDescriptionCard
                description={item.description}
                title={item.type === 'special' ? 'About This Special' : 'About This Event'}
              />
            </TransitionItem>
          </View>

          {showDeferredSections ? (
            <>
              <View style={styles.mainColumn}>
                <TransitionItem role="support" index={3}>
                  <EventSpecialMoreDatesCard
                    currentStartISO={item.startDateISO}
                    currentEndISO={item.endDateISO}
                    occurrences={item.occurrencesList}
                    onPressDate={(occurrenceId) => {
                      const target = item.type === 'special'
                        ? routes.specialDetail(occurrenceId)
                        : routes.eventDetail(occurrenceId);
                      router.push(target as never);
                    }}
                  />
                </TransitionItem>

                <TransitionItem role="cta" index={4}>
                  <EventSpecialActionCard
                    item={item}
                    routeType={routeType}
                    isGoing={rsvp.isGoing}
                    rsvpCount={rsvp.count}
                    rsvpBusy={rsvp.isToggling}
                    reminderBusy={reminder.isMutating}
                    hasReminder1Day={reminder.hasReminder('1_day')}
                    hasReminder2Hours={reminder.hasReminder('2_hours')}
                    onPressGoing={onPressGoing}
                    onPressReminder={onPressReminder}
                    onPressWriteReview={onPressWriteReview}
                  />
                </TransitionItem>

                <TransitionItem role="support" index={5}>
                  <EventSpecialDetailsCard item={item} />
                </TransitionItem>

                <TransitionItem role="support" index={6}>
                  <EventSpecialContactInfoCard item={item} />
                </TransitionItem>
              </View>

              <TransitionItem role="support" index={7}>
                <EventSpecialReviewsSection
                  title={item.type === 'special' ? 'Special Reviews' : 'Event Reviews'}
                  targetId={id ?? item.id}
                  reviews={reviews.reviews}
                  isLoading={reviews.isLoading}
                  error={reviews.error}
                  onRefresh={() => {
                    void reviews.refetch();
                  }}
                  onPressWriteReview={onPressWriteReview}
                />
              </TransitionItem>

              <TransitionItem role="support" index={8}>
                <EventSpecialRelatedSection
                  title={item.type === 'special' ? 'More Specials Near You' : 'More Events Near You'}
                  items={related.items}
                  isLoading={related.isLoading}
                  error={related.error}
                />
              </TransitionItem>
            </>
          ) : null}
        </ScrollView>
      </ScreenTransitionScope>
    </>
  );
}
