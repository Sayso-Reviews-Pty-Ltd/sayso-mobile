import { Redirect } from 'expo-router';
import { routes } from '../src/navigation/routes';

export default function IndexScreen() {
  return <Redirect href={routes.home() as never} />;
}
