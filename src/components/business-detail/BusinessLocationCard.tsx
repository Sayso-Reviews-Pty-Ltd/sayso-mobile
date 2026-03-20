import { useEffect, useMemo, useState } from 'react';
import { Clipboard, Linking, Modal, Pressable, Share, View } from 'react-native';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { SkeletonBlock } from '../SkeletonBlock';
import { Text } from '../Typography';
import { businessDetailColors } from './styles';
import {
  buildBusinessMapPreviewUrl,
  buildGoogleDirectionsUrl,
  buildGoogleWalkingUrl,
  buildUberUrl,
} from './utils';
import { styles } from './BusinessLocationCard.styles';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateTravelTime(distanceKm: number, mode: 'drive' | 'walk'): string {
  const speed = mode === 'walk' ? 5 : 40;
  const minutes = Math.round((distanceKm / speed) * 60);
  if (minutes < 60) return `${minutes} min ${mode}`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m ${mode}` : `${h}h ${mode}`;
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

type Props = {
  name: string;
  address?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export function BusinessLocationCard({ name, address, location, latitude, longitude }: Props) {
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [copied, setCopied] = useState(false);
  const displayLocation = address || location || '';
  const hasCoordinates = typeof latitude === 'number' && typeof longitude === 'number';

  useEffect(() => {
    if (!hasCoordinates) return;
    let cancelled = false;
    setLoadingLocation(true);
    void (async () => {
      try {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (!perm.granted || cancelled) return;
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (cancelled) return;
        setDistance(haversineKm(pos.coords.latitude, pos.coords.longitude, latitude!, longitude!));
      } catch {
        // No-op — distance stays null.
      } finally {
        if (!cancelled) setLoadingLocation(false);
      }
    })();
    return () => { cancelled = true; };
  }, [hasCoordinates, latitude, longitude]);

  const handleCopyAddress = () => {
    const text = displayLocation;
    if (!text) return;
    Clipboard.setString(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const mapPreviewUrl = useMemo(
    () =>
      buildBusinessMapPreviewUrl({
        lat: latitude,
        lng: longitude,
      }),
    [latitude, longitude]
  );

  const directionsUrl = useMemo(
    () => buildGoogleDirectionsUrl(name, latitude, longitude, displayLocation),
    [name, latitude, longitude, displayLocation]
  );
  const walkingUrl = useMemo(
    () => buildGoogleWalkingUrl(name, latitude, longitude, displayLocation),
    [name, latitude, longitude, displayLocation]
  );
  const uberUrl = useMemo(() => buildUberUrl(name, latitude, longitude), [name, latitude, longitude]);

  if (!hasCoordinates && !displayLocation) {
    return null;
  }

  const handleShare = async () => {
    try {
      await Share.share({
        title: name,
        message: `${name} - ${displayLocation || 'Cape Town'}\n${directionsUrl}`,
      });
    } catch {
      // No-op to avoid blocking navigation.
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconPill}>
            <Ionicons name="location-outline" size={16} color={businessDetailColors.charcoal} />
          </View>
          <Text style={styles.heading}>Location</Text>
        </View>
        <View style={styles.headerActions}>
          {displayLocation ? (
            <Pressable
              onPress={handleCopyAddress}
              style={styles.headerAction}
              accessibilityLabel="Copy address"
            >
              <Ionicons
                name={copied ? 'checkmark' : 'copy'}
                size={15}
                color={businessDetailColors.charcoal}
              />
            </Pressable>
          ) : null}
          <Pressable onPress={handleShare} style={styles.headerAction} accessibilityLabel="Share business location">
            <Ionicons name="share-social-outline" size={15} color={businessDetailColors.charcoal} />
          </Pressable>
        </View>
      </View>

      {displayLocation ? <Text style={styles.locationLabel}>{displayLocation}</Text> : null}

      {loadingLocation ? (
        <View style={styles.distanceLoading}>
          <SkeletonBlock style={styles.distancePillSkeletonShort} />
          <SkeletonBlock style={styles.distancePillSkeletonMedium} />
          <SkeletonBlock style={styles.distancePillSkeletonShort} />
        </View>
      ) : distance !== null ? (
        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <Ionicons name="navigate-outline" size={12} color={businessDetailColors.sage} />
            <Text style={styles.pillText}>{formatDistance(distance)} away</Text>
          </View>
          <View style={styles.pill}>
            <Ionicons name="car-outline" size={12} color={businessDetailColors.coral} />
            <Text style={styles.pillText}>{estimateTravelTime(distance, 'drive')}</Text>
          </View>
          {distance < 3 ? (
            <View style={styles.pill}>
              <Ionicons name="walk-outline" size={12} color={businessDetailColors.textMuted} />
              <Text style={styles.pillText}>{estimateTravelTime(distance, 'walk')}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {mapPreviewUrl ? (
        <Pressable style={styles.mapPreviewWrap} onPress={() => setMapModalOpen(true)}>
          <Image source={{ uri: mapPreviewUrl }} style={styles.mapPreview} contentFit="cover" />
          <View style={styles.mapOverlay}>
            <View style={styles.mapOverlayPill}>
              <Ionicons name="expand-outline" size={14} color={businessDetailColors.charcoal} />
              <Text style={styles.mapOverlayText}>View larger</Text>
            </View>
          </View>
        </Pressable>
      ) : (
        <View style={styles.mapFallback}>
          <Ionicons name="map-outline" size={28} color={businessDetailColors.textMuted} />
          <Text style={styles.mapFallbackText}>Map coordinates are not available yet.</Text>
        </View>
      )}

      <View style={styles.actionRow}>
        <Pressable style={styles.actionPrimary} onPress={() => Linking.openURL(directionsUrl)}>
          <Ionicons name="navigate-outline" size={15} color={businessDetailColors.white} />
          <Text style={styles.actionPrimaryText}>Get directions</Text>
        </Pressable>

        <Pressable style={styles.actionCircle} onPress={() => Linking.openURL(walkingUrl)}>
          <Ionicons name="walk-outline" size={15} color={businessDetailColors.charcoal} />
        </Pressable>
      </View>

      {uberUrl ? (
        <Pressable style={styles.uberButton} onPress={() => Linking.openURL(uberUrl)}>
          <Text style={styles.uberButtonText}>Get an Uber</Text>
        </Pressable>
      ) : null}

      <Modal visible={mapModalOpen} animationType="slide" transparent onRequestClose={() => setMapModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalShell}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {name}
                </Text>
                {displayLocation ? (
                  <Text style={styles.modalSubtitle} numberOfLines={2}>
                    {displayLocation}
                  </Text>
                ) : null}
              </View>
              <Pressable style={styles.modalClose} onPress={() => setMapModalOpen(false)}>
                <Ionicons name="close-outline" size={20} color={businessDetailColors.white} />
              </Pressable>
            </View>

            {mapPreviewUrl ? (
              <Image source={{ uri: mapPreviewUrl }} style={styles.modalMap} contentFit="cover" />
            ) : (
              <View style={styles.modalMapFallback}>
                <Ionicons name="map-outline" size={34} color="rgba(255,255,255,0.72)" />
              </View>
            )}

            <View style={styles.modalFooter}>
              <Pressable style={styles.modalActionPrimary} onPress={() => Linking.openURL(directionsUrl)}>
                <Ionicons name="car-outline" size={15} color={businessDetailColors.white} />
                <Text style={styles.modalActionPrimaryText}>Drive</Text>
              </Pressable>

              <Pressable style={styles.modalActionSecondary} onPress={() => Linking.openURL(walkingUrl)}>
                <Ionicons name="walk-outline" size={15} color={businessDetailColors.white} />
                <Text style={styles.modalActionSecondaryText}>Walk</Text>
              </Pressable>

              <Pressable style={styles.modalShare} onPress={handleShare}>
                <Ionicons name="share-social-outline" size={17} color={businessDetailColors.white} />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
