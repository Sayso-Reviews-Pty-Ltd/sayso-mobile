import type { BusinessListItemDto } from '@sayso/contracts';
import type { ListRenderItem } from 'react-native';
import { BusinessCard } from '../../../components/BusinessCard';
import { TransitionItem } from '../../../components/motion/TransitionItem';

export const trendingKeyExtractor = (item: BusinessListItemDto) => item.id;

export const trendingRenderItem: ListRenderItem<BusinessListItemDto> = ({ item, index }) => (
  <TransitionItem variant="listItem" index={index}>
    <BusinessCard business={item} />
  </TransitionItem>
);
