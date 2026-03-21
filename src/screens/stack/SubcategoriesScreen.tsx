import { View } from 'react-native';
import { Stack } from 'expo-router';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { Text } from '../../components/Typography';
import { FooterCta } from './subcategories/FooterCta';
import { GroupList } from './subcategories/GroupList';
import { styles } from './subcategories/styles';
import { useSubcategoriesController } from './subcategories/useSubcategoriesController';

export default function SubcategoriesScreen() {
  const {
    atMax,
    canContinue,
    counterAnimStyle,
    error,
    getPillMutables,
    groupMutables,
    handleBack,
    handleContinue,
    helperText,
    isLoading,
    selected,
    selectedCount,
    toggle,
    visibleGroups,
  } = useSubcategoriesController();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <OnboardingLayout
        step={2}
        totalSteps={4}
        title="Let's Get More Specific!"
        subtitle="Select specific areas within your interests"
        titleTyping
        titleTypingDelayMs={300}
        titleTypingSpeedMs={40}
        onBack={handleBack}
        onContinue={handleContinue}
        canContinue={canContinue}
        isLoading={isLoading}
      >
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <FooterCta
          counterAnimStyle={counterAnimStyle}
          helperText={helperText}
          selectedCount={selectedCount}
        />

        <GroupList
          atMax={atMax}
          getPillMutables={getPillMutables}
          groups={visibleGroups}
          groupMutables={groupMutables}
          onToggle={toggle}
          selected={selected}
        />
      </OnboardingLayout>
    </>
  );
}
