import {
  BusinessPageHeader,
  type BusinessHeaderMenuItem,
  type BusinessHeaderRightAction,
} from '../business-detail';

export type EventSpecialHeaderMenuItem = BusinessHeaderMenuItem;
export type EventSpecialHeaderRightAction = BusinessHeaderRightAction;

type Props = {
  onPressBack: () => void;
  onPressNotifications: () => void;
  onPressMessages: () => void;
  menuItems?: EventSpecialHeaderMenuItem[];
  rightActions?: EventSpecialHeaderRightAction[];
  collapsed?: boolean;
};

export function EventSpecialPageHeader(props: Props) {
  return <BusinessPageHeader {...props} />;
}
