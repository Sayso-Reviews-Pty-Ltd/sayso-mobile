import { Redirect } from 'expo-router';
import { routes } from '../../src/navigation/routes';

export default function EventsRoute() {
  return <Redirect href={routes.eventsSpecials() as never} />;
}
