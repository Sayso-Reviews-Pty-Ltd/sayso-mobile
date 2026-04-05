import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { Text } from '../../components/Typography';
import { useEditPreferencesController } from './edit-preferences/useEditPreferencesController';
import { InterestsSection } from './edit-preferences/InterestsSection';
import { SubcategoriesSection } from './edit-preferences/SubcategoriesSection';
import { DealbreakersSection } from './edit-preferences/DealbreakersSection';

const WINE = '#722F37';
const OFF_WHITE = '#E5E0E5';
const CARD_BG = '#9DAB9B';

export default function EditPreferencesScreen() {
  const {
    selectedInterests,
    selectedSubs,
    selectedDB,
    isLoading,
    hydrated,
    saving,
    error,
    canSave,
    toggleInterest,
    toggleSubcategory,
    toggleDealbreaker,
    handleSave,
  } = useEditPreferencesController();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit Preferences',
          headerRight: () => (
            <Pressable onPress={handleSave} disabled={!canSave} style={styles.saveBtn} hitSlop={8}>
              {saving ? (
                <ActivityIndicator size="small" color={WINE} />
              ) : (
                <Text style={[styles.saveBtnText, !canSave && styles.saveBtnDisabled]}>Save</Text>
              )}
            </Pressable>
          ),
        }}
      />

      {isLoading && !hydrated ? (
        <View style={styles.loader}>
          <ActivityIndicator color={WINE} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <InterestsSection selected={selectedInterests} onToggle={toggleInterest} />
          </View>

          <View style={styles.card}>
            <SubcategoriesSection
              selectedInterests={selectedInterests}
              selectedSubs={selectedSubs}
              onToggle={toggleSubcategory}
            />
          </View>

          <View style={styles.card}>
            <DealbreakersSection selected={selectedDB} onToggle={toggleDealbreaker} />
          </View>
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: OFF_WHITE },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: OFF_WHITE },
  saveBtn: { paddingHorizontal: 4 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: WINE },
  saveBtnDisabled: { color: 'rgba(114,47,55,0.38)' },
  errorBanner: {
    backgroundColor: 'rgba(185,28,28,0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(185,28,28,0.25)',
  },
  errorText: { fontSize: 13, color: '#B91C1C', fontWeight: '500' },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
});
