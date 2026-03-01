import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius, FontSizes } from '@/constants/theme';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

interface MonthlyCalendarProps {
  currentYear: number;
  currentMonth: number; // 1-based (1=January)
  recordDates: Set<string>; // Set of 'YYYY-MM-DD' strings
  selectedDate: string | null; // 'YYYY-MM-DD' or null
  onMonthChange: (year: number, month: number) => void;
  onDateSelect: (date: string) => void;
}

export function MonthlyCalendar({
  currentYear,
  currentMonth,
  recordDates,
  selectedDate,
  onMonthChange,
  onDateSelect,
}: MonthlyCalendarProps) {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const textMuted = useThemeColor({}, 'textMuted');
  const surfaceColor = useThemeColor({}, 'surface');

  const currentDate = useMemo(
    () => new Date(currentYear, currentMonth - 1, 1),
    [currentYear, currentMonth]
  );

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  const handlePrevMonth = () => {
    const prev = subMonths(currentDate, 1);
    onMonthChange(prev.getFullYear(), prev.getMonth() + 1);
  };

  const handleNextMonth = () => {
    const next = addMonths(currentDate, 1);
    onMonthChange(next.getFullYear(), next.getMonth() + 1);
  };

  const headerLabel = `${currentYear}년 ${currentMonth}월`;

  return (
    <View style={[styles.container, { backgroundColor: surfaceColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
          <IconSymbol name="chevron.left" size={16} color={textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: textColor }]}>{headerLabel}</Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <IconSymbol name="chevron.right" size={16} color={textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.dayLabelsRow}>
        {DAY_LABELS.map((label, i) => (
          <View key={label} style={styles.dayLabelCell}>
            <Text
              style={[
                styles.dayLabelText,
                { color: i === 0 ? '#D45555' : textMuted },
              ]}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.datesGrid}>
        {calendarDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isCurrentMonth = day.getMonth() === currentMonth - 1;
          const isTodayDate = isToday(day);
          const isSelected = selectedDate === dateStr;
          const hasRecord = recordDates.has(dateStr);
          const isSunday = day.getDay() === 0;

          return (
            <TouchableOpacity
              key={dateStr}
              style={styles.dateCell}
              onPress={() => isCurrentMonth && onDateSelect(dateStr)}
              activeOpacity={isCurrentMonth ? 0.6 : 1}
            >
              <View
                style={[
                  styles.dateCircle,
                  isTodayDate && { backgroundColor: tintColor + '20' },
                  isSelected && { backgroundColor: tintColor },
                ]}
              >
                <Text
                  style={[
                    styles.dateText,
                    { color: isCurrentMonth ? textColor : textMuted + '40' },
                    isSunday && isCurrentMonth && { color: '#D45555' },
                    isSelected && { color: '#FFFFFF' },
                  ]}
                >
                  {format(day, 'd')}
                </Text>
              </View>
              {hasRecord && isCurrentMonth && (
                <View style={[styles.dot, { backgroundColor: tintColor }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  navButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  dayLabelsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  dayLabelCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  dayLabelText: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
  },
  datesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateCell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dateCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: FontSizes.sm,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});
