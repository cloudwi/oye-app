import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useInquiryDetail } from '@/hooks/queries/use-inquiry-detail';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { router, useLocalSearchParams } from 'expo-router';
import {
  BrandColors,
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
} from '@/constants/theme';

export default function InquiryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');
  const dividerColor = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'divider');

  const { data: inquiry, isLoading } = useInquiryDetail(Number(id));

  const getStatusLabel = (status: string) => {
    return status === 'ANSWERED' ? '답변 완료' : '답변 대기';
  };

  const getStatusColor = (status: string) => {
    return status === 'ANSWERED' ? BrandColors.success : BrandColors.warning;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={20} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>문의 상세</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!inquiry) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={20} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>문의 상세</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={{ color: textSecondary }}>문의를 찾을 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const createdDate = format(parseISO(inquiry.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={20} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>문의 상세</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Inquiry Section */}
        <View style={[styles.card, { backgroundColor: surfaceColor }, Shadows.sm]}>
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(inquiry.status) + '15' },
              ]}
            >
              <Text style={[styles.statusText, { color: getStatusColor(inquiry.status) }]}>
                {getStatusLabel(inquiry.status)}
              </Text>
            </View>
            <Text style={[styles.dateText, { color: textSecondary }]}>{createdDate}</Text>
          </View>

          <Text style={[styles.inquiryTitle, { color: textColor }]}>{inquiry.title}</Text>

          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          <Text style={[styles.inquiryContent, { color: textColor }]}>{inquiry.content}</Text>
        </View>

        {/* Admin Comments Section */}
        {inquiry.comments.map((comment) => (
          <View
            key={comment.id}
            style={[styles.card, styles.replyCard, { backgroundColor: surfaceColor }, Shadows.sm]}
          >
            <View style={styles.replyHeader}>
              <View style={[styles.replyIcon, { backgroundColor: BrandColors.accent + '15' }]}>
                <IconSymbol name="bubble.left.fill" size={14} color={BrandColors.accent} />
              </View>
              <Text style={[styles.replyLabel, { color: BrandColors.accent }]}>
                {comment.adminName}
              </Text>
              <Text style={[styles.dateText, { color: textSecondary, marginLeft: 'auto' }]}>
                {format(parseISO(comment.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
              </Text>
            </View>

            <Text style={[styles.replyContent, { color: textColor }]}>{comment.content}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSizes.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  dateText: {
    fontSize: FontSizes.xs,
  },
  inquiryTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  divider: {
    height: 1,
    marginBottom: Spacing.md,
  },
  inquiryContent: {
    fontSize: FontSizes.md,
    lineHeight: 24,
  },
  replyCard: {
    borderLeftWidth: 3,
    borderLeftColor: BrandColors.accent,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  replyIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  replyContent: {
    fontSize: FontSizes.md,
    lineHeight: 24,
  },
});
