import { useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useReducedMotion } from '../../../../hooks/useReducedMotion';
import { getBusinessPlaceholder } from '../../../../lib/businessPlaceholders';
import { Text } from '../../../../components/Typography';
import { C, HERO_HEIGHT, HERO_WIDTH } from '../constants';
import { isPlaceholderImage } from '../helpers';

type Props = {
  images: string[];
  subcategorySlug?: string | null;
};

export function ReviewHeroCarousel({ images, subcategorySlug }: Props) {
  const reducedMotion = useReducedMotion();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const validImages = images.filter((img) => img && img.trim() !== '' && !isPlaceholderImage(img));
  const total = validImages.length;

  if (total === 0) {
    const placeholder = getBusinessPlaceholder(subcategorySlug);
    return (
      <View style={styles.container}>
        <Image source={placeholder} style={styles.bgImage} blurRadius={20} />
        <Image source={placeholder} style={styles.fgImage} resizeMode="cover" />
      </View>
    );
  }

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, total - 1));
    scrollRef.current?.scrollTo({ x: clamped * HERO_WIDTH, animated: !reducedMotion });
    setCurrentIndex(clamped);
  };

  const handleScroll = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / HERO_WIDTH);
    setCurrentIndex(Math.max(0, Math.min(index, total - 1)));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        scrollEnabled={total > 1}
      >
        {validImages.map((uri, i) => (
          <View key={i} style={styles.slide}>
            {!imgErrors[i] && (
              <Image
                source={{ uri }}
                style={styles.bgImage}
                blurRadius={20}
                onError={() => setImgErrors((prev) => ({ ...prev, [i]: true }))}
              />
            )}
            {imgErrors[i] ? (
              <View style={styles.errorState}>
                <Ionicons name="image-outline" size={40} color="rgba(45,45,45,0.30)" />
                <Text style={styles.errorText}>Image unavailable</Text>
              </View>
            ) : (
              <Image source={{ uri }} style={styles.fgImage} resizeMode="cover" />
            )}
          </View>
        ))}
      </ScrollView>

      {total > 1 && (
        <>
          <Pressable style={[styles.navBtn, styles.navBtnLeft]} onPress={() => goTo(currentIndex - 1)}>
            <Ionicons name="chevron-back-outline" size={22} color={C.charcoal} />
          </Pressable>
          <Pressable style={[styles.navBtn, styles.navBtnRight]} onPress={() => goTo(currentIndex + 1)}>
            <Ionicons name="chevron-forward-outline" size={22} color={C.charcoal} />
          </Pressable>
          <View style={styles.dotsRow}>
            {validImages.map((_, i) => (
              <Pressable key={i} onPress={() => goTo(i)}>
                <View style={[styles.dot, i === currentIndex && styles.dotActive]} />
              </Pressable>
            ))}
          </View>
          <View style={styles.counterPill}>
            <Text style={styles.counterText}>{currentIndex + 1} / {total}</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: HERO_WIDTH,
    height: HERO_HEIGHT,
    borderWidth: 1,
    borderColor: 'rgba(125,155,118,0.12)',
    backgroundColor: C.cardBg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  slide: {
    width: HERO_WIDTH,
    height: HERO_HEIGHT,
    overflow: 'hidden',
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  fgImage: {
    ...StyleSheet.absoluteFillObject,
  },
  navBtn: {
    position: 'absolute',
    top: HERO_HEIGHT / 2 - 22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  navBtnLeft: { left: 12 },
  navBtnRight: { right: 12 },
  dotsRow: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  dotActive: {
    width: 28,
    borderRadius: 4,
    backgroundColor: C.white,
  },
  counterPill: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(45,45,45,0.80)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  counterText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.white,
  },
  errorState: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.charcoal10,
  },
  errorText: {
    fontSize: 12,
    color: 'rgba(45,45,45,0.45)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
