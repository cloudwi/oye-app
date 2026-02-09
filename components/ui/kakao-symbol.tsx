import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface KakaoSymbolProps {
  size?: number;
  color?: string;
}

export function KakaoSymbol({ size = 24, color = '#000000' }: KakaoSymbolProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3C6.48 3 2 6.54 2 10.8c0 2.76 1.84 5.18 4.6 6.54-.2.72-.74 2.62-.84 3.04-.14.5.18.5.38.36.16-.1 2.54-1.72 3.56-2.42.74.1 1.5.16 2.3.16 5.52 0 10-3.54 10-7.68S17.52 3 12 3Z"
        fill={color}
      />
    </Svg>
  );
}
