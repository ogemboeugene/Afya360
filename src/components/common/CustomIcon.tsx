/**
 * Custom Icon Component
 * Unified icon interface for different icon libraries
 */

import React from 'react';
import { ViewStyle } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

export type IconLibrary = 'MaterialIcons' | 'FontAwesome5' | 'MaterialCommunityIcons' | 'Ionicons';

export interface CustomIconProps {
  name: string;
  size?: number;
  color?: string;
  library?: IconLibrary;
  style?: ViewStyle;
}

export const CustomIcon: React.FC<CustomIconProps> = ({
  name,
  size = 24,
  color = '#000',
  library = 'MaterialIcons',
  style,
}) => {
  const iconProps = {
    name,
    size,
    color,
    style,
  };

  switch (library) {
    case 'FontAwesome5':
      return <FontAwesome5 {...iconProps} />;
    case 'MaterialCommunityIcons':
      return <MaterialCommunityIcons {...iconProps} />;
    case 'Ionicons':
      return <Ionicons {...iconProps} />;
    case 'MaterialIcons':
    default:
      return <MaterialIcons {...iconProps} />;
  }
};

export default CustomIcon;
