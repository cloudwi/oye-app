import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';

const ITEM_HEIGHT = 44;

interface ScrollPickerProps {
  data: number[];
  selected: number | null;
  onSelect: (value: number) => void;
  label: string;
  formatter?: (value: number) => string;
  maxHeight?: number;
}

export function ScrollPicker({
  data,
  selected,
  onSelect,
  label,
  formatter,
  maxHeight,
}: ScrollPickerProps) {
  const tintColor = useThemeColor({}, 'tint');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');

  return (
    <View style={[styles.pickerWrapper, { backgroundColor: surfaceColor }, Shadows.sm, maxHeight != null && { maxHeight }]}>
      <Text style={[styles.pickerLabel, { color: textSecondary }]}>{label}</Text>
      <ScrollView
        style={styles.picker}
        contentContainerStyle={styles.pickerContent}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
      >
        {data.map((item) => {
          const isSelected = selected === item;
          const displayLabel = formatter ? formatter(item) : String(item);
          return (
            <TouchableOpacity
              key={item}
              style={[
                styles.pickerItem,
                isSelected && { backgroundColor: tintColor + '15' },
              ]}
              onPress={() => onSelect(item)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pickerText,
                  { color: isSelected ? tintColor : textSecondary },
                  isSelected && styles.pickerTextSelected,
                ]}
              >
                {displayLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export { ITEM_HEIGHT };

const styles = StyleSheet.create({
  pickerWrapper: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    maxHeight: 280,
  },
  pickerLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  picker: {
    flex: 1,
  },
  pickerContent: {
    paddingVertical: Spacing.xs,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  pickerText: {
    fontSize: FontSizes.md,
  },
  pickerTextSelected: {
    fontWeight: '700',
  },
});
