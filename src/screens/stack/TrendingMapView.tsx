import { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import type { BusinessListItemDto } from '@sayso/contracts';
import { routes } from '../../navigation/routes';
import { configureMapLibreAccessToken, getMapLibreModule } from '../../lib/maplibre';
import {
  CAPE_TOWN_CENTER,
  MAPBOX_ACCESS_TOKEN,
} from '../../components/home/mapPreviewShared';
import { BusinessCallout } from './trending-map/BusinessCallout';
import { BusinessMarker } from './trending-map/BusinessMarker';
import { ClusterMarker } from './trending-map/ClusterMarker';
import { buildClusters, getOffsetCoordinate } from './trending-map/clustering';
import { MapUnavailableState } from './trending-map/MapUnavailableState';
import { styles } from './trending-map/styles';
import type { Cluster, MappedBusiness } from './trending-map/types';

configureMapLibreAccessToken(MAPBOX_ACCESS_TOKEN);

const MAP_STYLE = `https://api.mapbox.com/styles/v1/mapbox/streets-v12?access_token=${MAPBOX_ACCESS_TOKEN}`;

type Props = {
  businesses: BusinessListItemDto[];
  userLocation: { lat: number; lng: number } | null;
};

export function TrendingMapView({ businesses, userLocation }: Props) {
  const router = useRouter();
  const mapLibre = useMemo(() => getMapLibreModule(), []);
  const cameraRef = useRef<any>(null);
  const mapBusinesses = businesses.filter(
    (business): business is MappedBusiness => business.lat != null && business.lng != null
  );
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<MappedBusiness | null>(null);

  const clusters = useMemo<Cluster[]>(() => buildClusters(mapBusinesses), [mapBusinesses]);

  useEffect(() => {
    if (!expandedClusterId) return;
    if (!clusters.some((cluster) => cluster.id === expandedClusterId)) {
      setExpandedClusterId(null);
    }
  }, [clusters, expandedClusterId]);

  const mapCenter = userLocation ?? CAPE_TOWN_CENTER;

  const handlePinPress = (business: MappedBusiness) => {
    setExpandedClusterId(null);
    setSelectedBusiness(business);
  };

  const handleViewBusiness = (businessId: string) => {
    setSelectedBusiness(null);
    router.push(routes.businessDetail(businessId) as never);
  };

  const handleMapPress = () => {
    setExpandedClusterId(null);
    setSelectedBusiness(null);
  };

  if (!mapLibre) {
    return <MapUnavailableState />;
  }

  const MapLibre = mapLibre as any;

  return (
    <View style={styles.container}>
      <MapLibre.MapView
        style={styles.map}
        styleURL={MAP_STYLE}
        onPress={handleMapPress}
        attributionEnabled={false}
        logoEnabled={false}
        compassEnabled={false}
        scaleBarEnabled={false}
      >
        <MapLibre.Camera
          ref={cameraRef}
          centerCoordinate={[mapCenter.lng, mapCenter.lat]}
          zoomLevel={12}
          animationDuration={0}
        />

        {clusters.map((cluster) => {
          if (cluster.members.length <= 1) {
            const business = cluster.members[0];
            const isSelected = selectedBusiness?.id === business.id;
            return (
              <MapLibre.MarkerView
                key={business.id}
                id={business.id}
                coordinate={[business.lng, business.lat]}
              >
                <BusinessMarker
                  isSelected={isSelected}
                  onPress={() => handlePinPress(business)}
                />
              </MapLibre.MarkerView>
            );
          }

          const isExpanded = expandedClusterId === cluster.id;
          if (!isExpanded) {
            return (
              <MapLibre.MarkerView
                key={cluster.id}
                id={cluster.id}
                coordinate={[cluster.centerLng, cluster.centerLat]}
              >
                <ClusterMarker
                  count={cluster.members.length}
                  onPress={() => setExpandedClusterId(cluster.id)}
                />
              </MapLibre.MarkerView>
            );
          }

          return cluster.members.map((business, index) => {
            const offset = getOffsetCoordinate(
              cluster.centerLat,
              cluster.centerLng,
              index,
              cluster.members.length
            );
            const isSelected = selectedBusiness?.id === business.id;
            return (
              <MapLibre.MarkerView
                key={`${cluster.id}-${business.id}`}
                id={`${cluster.id}-${business.id}`}
                coordinate={[offset.longitude, offset.latitude]}
              >
                <BusinessMarker
                  isSelected={isSelected}
                  onPress={() => handlePinPress(business)}
                />
              </MapLibre.MarkerView>
            );
          });
        })}

        {userLocation ? (
          <MapLibre.MarkerView
            key="user-location"
            id="user-location"
            coordinate={[userLocation.lng, userLocation.lat]}
          >
            <View style={styles.userLocationMarker}>
              <View style={styles.userLocationDot} />
            </View>
          </MapLibre.MarkerView>
        ) : null}
      </MapLibre.MapView>

      {selectedBusiness ? (
        <BusinessCallout
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
          onView={() => handleViewBusiness(selectedBusiness.id)}
        />
      ) : null}
    </View>
  );
}
