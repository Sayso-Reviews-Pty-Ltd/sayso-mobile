import { PlaceholderScreen } from '../../src/screens/shared/PlaceholderScreen';
import { routes } from '../../src/navigation/routes';

export default function SubcategoriesIndexRoute() {
  return (
    <PlaceholderScreen
      title="Subcategories"
      description="This screen will become the mobile taxonomy index. The route exists now so Explore can push into a stable subcategory chooser."
      actions={[
        { label: 'Open Restaurants', href: routes.category('restaurants') },
        { label: 'Open Wellness', href: routes.category('wellness') },
      ]}
    />
  );
}
