import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { routes } from '../../navigation/routes';
import { AppHeader } from '../../components/AppHeader';
import { Text } from '../../components/Typography';

const groups = [
  {
    title: 'Browse by category',
    items: [
      { label: 'Restaurants', href: routes.category('restaurants') },
      { label: 'Wellness', href: routes.category('wellness') },
      { label: 'Food & Drink', href: routes.categorySlug('food-drink') },
      { label: 'All subcategories', href: routes.subcategories() },
    ],
  },
  {
    title: 'Collections',
    items: [
      { label: 'Date night', href: routes.exploreIntent('date-night') },
      { label: 'Weekend picks', href: routes.exploreCollection('weekend-picks') },
      { label: 'Cape Town', href: routes.exploreArea('cape-town') },
      { label: 'Food & Drink', href: routes.exploreCategory('food-drink') },
    ],
  },
];

export default function ExploreHubScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Explore" subtitle="Browse categories, areas, collections, and intents" />
        {groups.map((group) => (
          <View key={group.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{group.title}</Text>
            <View style={styles.cardGrid}>
              {group.items.map((item) => (
                <TouchableOpacity
                  key={item.href}
                  style={styles.card}
                  onPress={() => router.push(item.href as never)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cardTitle}>{item.label}</Text>
                  <Text style={styles.cardBody}>Open this branch of discovery on mobile.</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    paddingBottom: 24,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  cardGrid: {
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 20,
    color: '#6B7280',
  },
});
