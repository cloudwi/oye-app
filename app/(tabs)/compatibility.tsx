import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useMyCode } from '@/hooks/queries/use-my-code';
import { useConnections } from '@/hooks/queries/use-connections';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { router } from 'expo-router';
import {
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
  RelationConfig,
} from '@/constants/theme';
import { getScoreColor } from '@/utils/score';
import type { Connection, RelationType } from '@/types/connection';

export default function CompatibilityScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');

  const { data: myCode, isLoading: isCodeLoading, refetch: refetchCode } = useMyCode();
  const { data: connections, isLoading: isConnectionsLoading, refetch: refetchConnections } = useConnections();

  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchCode(), refetchConnections()]);
    setRefreshing(false);
  }, [refetchCode, refetchConnections]);

  const handleCopyCode = useCallback(async () => {
    if (!myCode?.code) return;
    await Clipboard.setStringAsync(myCode.code);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [myCode]);

  const handleShareCode = useCallback(async () => {
    if (!myCode?.code) return;
    const message = `[오늘의 예감] 궁합 초대 코드\n\n내 코드: ${myCode.code}\n\n오늘의 예감 앱에서 코드를 입력하고 궁합을 확인해보세요!`;

    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({ title: '오늘의 예감 - 궁합 초대', text: message });
        } else {
          await navigator.clipboard.writeText(message);
        }
      } else {
        const { Share } = require('react-native');
        await Share.share({ message, title: '오늘의 예감 - 궁합 초대' });
      }
    } catch {
      // User cancelled
    }
  }, [myCode]);

  const handleConnectionPress = useCallback((connection: Connection) => {
    router.push({ pathname: '/connection/[id]', params: { id: connection.id } });
  }, []);

  const isLoading = isCodeLoading || isConnectionsLoading;

  if (isLoading && !myCode && !connections) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>궁합</Text>
        </View>
        <View style={styles.skeletonContainer}>
          <Skeleton height={120} borderRadius={BorderRadius.xl} />
          <View style={{ marginTop: Spacing.lg, gap: Spacing.sm }}>
            <Skeleton height={72} borderRadius={BorderRadius.lg} />
            <Skeleton height={72} borderRadius={BorderRadius.lg} />
            <Skeleton height={72} borderRadius={BorderRadius.lg} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={tintColor}
          />
        }
      >
        {/* Header */}
        <Animated.View style={styles.header} entering={FadeIn.duration(300)}>
          <Text style={[styles.title, { color: textColor }]}>궁합</Text>
        </Animated.View>

        {/* My Code Card */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(100)}
          style={[styles.codeCard, { backgroundColor: surfaceColor }, Shadows.lg]}
        >
          <View style={styles.codeCardHeader}>
            <View style={[styles.codeIconBg, { backgroundColor: tintColor + '15' }]}>
              <IconSymbol name="link" size={18} color={tintColor} />
            </View>
            <Text style={[styles.codeLabel, { color: textSecondary }]}>내 초대 코드</Text>
          </View>

          <Text
            style={[styles.codeText, { color: textColor }]}
            accessibilityLabel={`내 초대 코드: ${myCode?.code || ''}`}
          >
            {myCode?.code || '------'}
          </Text>

          <View style={styles.codeActions}>
            <TouchableOpacity
              style={[styles.codeButton, { backgroundColor: tintColor }]}
              onPress={handleCopyCode}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="초대 코드 복사"
            >
              <IconSymbol name="doc.on.doc" size={16} color="#FFF" />
              <Text style={styles.codeButtonText}>{copied ? '복사됨!' : '복사'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.codeButton, styles.shareCodeButton, { borderColor: tintColor }]}
              onPress={handleShareCode}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="초대 코드 공유"
            >
              <IconSymbol name="square.and.arrow.up" size={16} color={tintColor} />
              <Text style={[styles.codeButtonText, { color: tintColor }]}>공유</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Add Connection Button */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: tintColor + '10' }]}
            onPress={() => router.push('/connection/connect')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="상대방 코드로 연결하기"
          >
            <IconSymbol name="plus" size={18} color={tintColor} />
            <Text style={[styles.addButtonText, { color: tintColor }]}>상대방 코드로 연결하기</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Connections Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>연결된 사람</Text>
          {connections && connections.length > 0 && (
            <Text style={[styles.sectionCount, { color: textSecondary }]}>
              {connections.length}명
            </Text>
          )}
        </View>

        {connections && connections.length > 0 ? (
          connections.map((connection, index) => {
            const config = RelationConfig[connection.relationType];
            return (
              <Animated.View
                key={connection.id}
                entering={FadeInDown.duration(400).delay(300 + index * 80)}
              >
                <TouchableOpacity
                  style={[styles.connectionItem, { backgroundColor: surfaceColor }, Shadows.sm]}
                  onPress={() => handleConnectionPress(connection)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`${connection.partnerName}, ${config.label}, 궁합 확인하기`}
                >
                  <View style={styles.connectionInfo}>
                    <View style={styles.connectionNameRow}>
                      <Text style={[styles.connectionName, { color: textColor }]}>
                        {connection.partnerName}
                      </Text>
                      <View style={[styles.relationBadge, { backgroundColor: config.color + '15' }]}>
                        <Text style={[styles.relationText, { color: config.color }]}>
                          {config.label}
                        </Text>
                      </View>
                    </View>
                    {connection.latestScore !== null ? (
                      <Text style={[styles.latestScore, { color: getScoreColor(connection.latestScore) }]}>
                        최근 궁합 {connection.latestScore}점
                      </Text>
                    ) : (
                      <Text style={[styles.latestScore, { color: textSecondary }]}>
                        아직 궁합을 확인하지 않았어요
                      </Text>
                    )}
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={textSecondary} />
                </TouchableOpacity>
              </Animated.View>
            );
          })
        ) : (
          <EmptyState
            icon="person.2.fill"
            title="아직 연결된 사람이 없어요"
            message="초대 코드를 공유하거나 상대방의 코드를 입력해보세요"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  skeletonContainer: {
    paddingHorizontal: Spacing.lg,
  },

  // Header
  header: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
  },

  // Code Card
  codeCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  codeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  codeIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  codeText: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  codeActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  codeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
  },
  shareCodeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  codeButtonText: {
    color: '#FFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },

  // Add Button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  addButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  sectionCount: {
    fontSize: FontSizes.sm,
  },

  // Connection Item
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  connectionInfo: {
    flex: 1,
  },
  connectionNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  connectionName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  relationBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  relationText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  latestScore: {
    fontSize: FontSizes.sm,
  },
});
