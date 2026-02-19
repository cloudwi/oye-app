import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { inquiryApi } from '@/services/api/inquiry';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmptyState } from '@/components/ui/empty-state';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { router } from 'expo-router';
import {
  BrandColors,
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
} from '@/constants/theme';
import type { Inquiry } from '@/types/inquiry';

const PAGE_SIZE = 20;

export default function InquiryListScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'surface');

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const result = await inquiryApi.getList(0, PAGE_SIZE);
      setInquiries(result.content);
      setPage(0);
      setTotalCount(result.totalElements);
      setHasMore(result.page < result.totalPages - 1);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    }
    setIsLoading(false);
  };

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoading) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await inquiryApi.getList(nextPage, PAGE_SIZE);
      if (result.content.length > 0) {
        setInquiries((prev) => [...prev, ...result.content]);
        setPage(nextPage);
      }
      setHasMore(result.page < result.totalPages - 1);
    } catch (error) {
      console.error('Error loading more inquiries:', error);
    }
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore, isLoading, page]);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await inquiryApi.getList(0, PAGE_SIZE);
      setInquiries(result.content);
      setPage(0);
      setTotalCount(result.totalElements);
      setHasMore(result.page < result.totalPages - 1);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    }
    setRefreshing(false);
    setIsLoading(false);
  };

  const getStatusLabel = (status: string) => {
    return status === 'ANSWERED' ? '답변 완료' : '답변 대기';
  };

  const getStatusColor = (status: string) => {
    return status === 'ANSWERED' ? BrandColors.success : BrandColors.warning;
  };

  const renderItem = ({ item }: { item: Inquiry }) => {
    const date = parseISO(item.createdAt);
    const formattedDate = format(date, 'yyyy.MM.dd', { locale: ko });

    return (
      <TouchableOpacity
        style={[styles.inquiryItem, { backgroundColor: surfaceColor }, Shadows.sm]}
        onPress={() => router.push(`/inquiry/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.itemHeader}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + '15' },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
          <Text style={[styles.dateText, { color: textSecondary }]}>{formattedDate}</Text>
        </View>
        <Text style={[styles.titleText, { color: textColor }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.contentPreview, { color: textSecondary }]} numberOfLines={2}>
          {item.content}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <EmptyState
      icon="envelope"
      title="문의 내역이 없어요"
      message="궁금한 점이 있으면 문의해 주세요"
    />
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={BrandColors.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={20} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>문의하기</Text>
        <TouchableOpacity
          onPress={() => router.push('/inquiry/write')}
          style={[styles.writeButton, { backgroundColor: BrandColors.accent }]}
        >
          <IconSymbol name="plus" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {totalCount > 0 && (
        <View style={styles.countContainer}>
          <Text style={[styles.countText, { color: textSecondary }]}>
            총 {totalCount}건
          </Text>
        </View>
      )}

      {isLoading && inquiries.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.accent} />
        </View>
      ) : (
        <FlatList
          data={inquiries}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={BrandColors.primary}
            />
          }
        />
      )}
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
  title: {
    flex: 1,
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  writeButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  countText: {
    fontSize: FontSizes.sm,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  footerLoader: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  inquiryItem: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  titleText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  contentPreview: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
});
