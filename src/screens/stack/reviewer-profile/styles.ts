import { StyleSheet } from 'react-native';
import { headerStyles } from './headerStyles';
import { listStyles } from './listStyles';
import { utilStyles } from './utilStyles';

export const styles = StyleSheet.create({
  ...headerStyles,
  ...listStyles,
  ...utilStyles,
});
