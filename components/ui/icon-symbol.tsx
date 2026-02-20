// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'pencil': 'edit',
  'chevron.up': 'expand-less',
  'chevron.down': 'expand-more',
  'sparkles': 'auto-awesome',
  'square.and.arrow.up': 'share',
  'lightbulb.fill': 'lightbulb',
  'exclamationmark.circle': 'error-outline',
  'calendar': 'calendar-today',
  'bell.fill': 'notifications',
  'moon.fill': 'dark-mode',
  'gearshape.fill': 'settings',
  'rectangle.portrait.and.arrow.right': 'logout',
  'trash.fill': 'delete',
  'clock': 'schedule',
  'clock.fill': 'schedule',
  'person.fill': 'person',
  'sun.max.fill': 'wb-sunny',
  'figure.stand': 'male',
  'figure.stand.dress': 'female',
  'arrow.clockwise': 'refresh',
  'plus': 'add',
  'bubble.left.fill': 'chat-bubble',
  'doc.text.fill': 'description',
  'doc.plaintext': 'article',
  'envelope.fill': 'email',
  'briefcase.fill': 'work',
  'brain': 'psychology',
  'drop.fill': 'water-drop',
  'star.fill': 'star',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
