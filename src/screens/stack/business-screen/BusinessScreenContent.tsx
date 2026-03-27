import { RefObject, MutableRefObject } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { InlineErrorBanner } from '../../../components/InlineErrorBanner';
import { Text } from '../../../components/Typography';
import {
  BusinessActionCard,
  BusinessContactCard,
  BusinessContactInfoCard,
  BusinessDescriptionCard,
  BusinessDetailsCard,
  BusinessHeroCarousel,
  BusinessInfoBlock,
  BusinessLocationCard,
  BusinessOwnedEventsSection,
  BusinessPageHeader,
  type BusinessHeaderRightAction,
  BusinessPerformanceInsightsCard,
  BusinessPhotoGrid,
  BusinessReviewsSection,
  PersonalizationInsightsCard,
  SimilarBusinessesSection,
} from '../../../components/business-detail';
import { businessDetailColors } from '../../../components/business-detail/styles';
import { TransitionItem } from '../../../components/motion/TransitionItem';
import { ScreenTransitionScope } from '../../../components/motion/TransitionScope';
import { routes } from '../../../navigation/routes';
import { styles } from './businessScreenStyles';
import type { useBusinessDetail } from '../../../hooks/useBusinessDetail';

type Business = NonNullable<ReturnType<typeof useBusinessDetail>['data']>;

type Props = {
  scrollRef: RefObject<ScrollView | null>;
  reviewsSectionYRef: MutableRefObject<number>;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  business: Business;
  images: string[];
  ratingMeta: { rating: number; reviewCount: number };
  categoryText: string;
  locationText: string;
  descriptionText: string;
  isError: boolean;
  businessError: Error | null;
  onRefetchBusiness: () => void;
  saveError: string | null;
  onDismissSaveError: () => void;
  headerRightActions: BusinessHeaderRightAction[];
  isBusinessOwner: boolean;
  initialTab?: 'overview' | 'reviews';
  newReviewId?: string;
  onPressBack: () => void;
  onPressNotifications: () => void;
  onPressMessages: () => void;
  onPressLeaveReview: () => void;
};

export function BusinessScreenContent({
  scrollRef,
  reviewsSectionYRef,
  onScroll,
  business,
  images,
  ratingMeta,
  categoryText,
  locationText,
  descriptionText,
  isError,
  businessError,
  onRefetchBusiness,
  saveError,
  onDismissSaveError,
  headerRightActions,
  isBusinessOwner,
  initialTab,
  newReviewId,
  onPressBack,
  onPressNotifications,
  onPressMessages,
  onPressLeaveReview,
}: Props) {
  const router = useRouter();

  return (
    <>
      <View style={[styles.stickyHeader, { backgroundColor: businessDetailColors.coral }]}>
        <BusinessPageHeader
          onPressBack={onPressBack}
          onPressNotifications={onPressNotifications}
          onPressMessages={onPressMessages}
          rightActions={headerRightActions}
          menuItems={[]}
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
          {isError && businessError ? (
            <View style={styles.statusBanner}>
              <InlineErrorBanner
                message={`Showing saved details. ${businessError instanceof Error ? businessError.message : 'Please refresh.'}`}
                actionLabel="Retry"
                onAction={onRefetchBusiness}
              />
            </View>
          ) : null}

          {saveError ? (
            <View style={styles.statusBanner}>
              <InlineErrorBanner
                message={saveError}
                actionLabel="Dismiss"
                onAction={onDismissSaveError}
              />
            </View>
          ) : null}

          <View style={styles.mainColumn}>
            <TransitionItem role="hero" index={0}>
              <BusinessHeroCarousel
                businessName={business.name}
                images={images}
                rating={ratingMeta.rating}
                verified={business.verified}
                subcategorySlug={business.primary_subcategory_slug ?? business.sub_interest_id ?? business.subInterestId}
                interestId={business.primary_category_slug ?? business.interest_id ?? business.interestId}
              />
            </TransitionItem>

            <TransitionItem role="subheading" index={1}>
              <BusinessInfoBlock
                name={business.name}
                rating={ratingMeta.rating}
                category={categoryText}
                location={locationText}
              />
            </TransitionItem>

            <TransitionItem role="support" index={2}>
              <BusinessDescriptionCard description={descriptionText} />
            </TransitionItem>

            <TransitionItem role="support" index={3}>
              <BusinessDetailsCard
                priceRange={business.price_range ?? business.priceRange}
                verified={business.verified}
                hours={business.hours}
                openingHours={business.openingHours}
                opening_hours={business.opening_hours}
              />
            </TransitionItem>

            <TransitionItem role="support" index={4} animate={false}>
              <BusinessPhotoGrid businessName={business.name} photos={images} />
            </TransitionItem>

            <TransitionItem role="support" index={5} animate={false}>
              <BusinessLocationCard
                name={business.name}
                address={business.address}
                location={business.location}
                latitude={business.lat}
                longitude={business.lng}
              />
            </TransitionItem>

            <TransitionItem role="support" index={6} animate={false}>
              <BusinessContactInfoCard
                phone={business.phone}
                email={business.email}
                website={business.website}
                address={business.address}
                location={business.location}
              />
            </TransitionItem>

            <TransitionItem role="cta" index={7} animate={false}>
              <BusinessActionCard
                onPressLeaveReview={onPressLeaveReview}
                onPressEditBusiness={() => router.push('/role-unsupported' as never)}
                isBusinessOwner={isBusinessOwner}
              />
            </TransitionItem>

            <TransitionItem role="support" index={8} animate={false}>
              <PersonalizationInsightsCard
                business={business}
                onPressLogin={() => router.push(routes.onboarding() as never)}
              />
            </TransitionItem>

            <TransitionItem role="support" index={9} animate={false}>
              <BusinessPerformanceInsightsCard
                punctuality={business.stats?.percentiles?.punctuality}
                costEffectiveness={business.stats?.percentiles?.['cost-effectiveness']}
                friendliness={business.stats?.percentiles?.friendliness}
                trustworthiness={business.stats?.percentiles?.trustworthiness}
              />
            </TransitionItem>

            <TransitionItem role="support" index={10} animate={false}>
              <BusinessContactCard
                businessId={business.id}
                businessName={business.name}
                phone={business.phone}
              />
            </TransitionItem>
          </View>

          <TransitionItem role="support" index={11} animate={false}>
            <BusinessOwnedEventsSection businessId={business.id} businessName={business.name} />
          </TransitionItem>

          <View
            onLayout={(e) => { reviewsSectionYRef.current = e.nativeEvent.layout.y; }}
          >
            <TransitionItem role="support" index={12} animate={false}>
              <BusinessReviewsSection
                businessId={business.id}
                onPressWriteReview={onPressLeaveReview}
                newReviewId={newReviewId}
              />
            </TransitionItem>
          </View>

          <TransitionItem role="support" index={13} animate={false}>
            <SimilarBusinessesSection businessId={business.id} />
          </TransitionItem>

          {initialTab === 'reviews' ? (
            <TransitionItem role="support" index={14} animate={false}>
              <View style={styles.deeplinkHint}>
                <Text style={styles.deeplinkHintText}>
                  This route now opens the write-review flow to match web behavior.
                </Text>
              </View>
            </TransitionItem>
          ) : null}
        </ScrollView>
      </ScreenTransitionScope>
    </>
  );
}
