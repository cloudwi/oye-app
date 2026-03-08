import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserStore } from '@/stores/user-store';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { SettingsHeader } from '@/components/ui/settings-header';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Spacing,
  BorderRadius,
  FontSizes,
  Shadows,
} from '@/constants/theme';

interface ProfileRowProps {
  icon: IconSymbolName;
  iconColor: string;
  title: string;
  value: string;
  onPress: () => void;
  isLast?: boolean;
}

function ProfileRow({ icon, iconColor, title, value, onPress, isLast = false }: ProfileRowProps) {
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const dividerColor = useThemeColor({}, 'divider');

  return (
    <TouchableOpacity
      style={[
        styles.row,
        !isLast && { borderBottomWidth: 1, borderBottomColor: dividerColor },
      ]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconColor + '15' }]}>
        <IconSymbol name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, { color: textSecondary }]}>{title}</Text>
        <Text style={[styles.rowValue, { color: textColor }]}>{value}</Text>
      </View>
      <IconSymbol name="chevron.right" size={14} color={textSecondary} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');

  const { user } = useUserStore();

  const formattedBirthDate = user?.birthDate
    ? format(new Date(user.birthDate), 'yyyy.MM.dd', { locale: ko })
    : '미설정';
  const calendarLabel = user?.calendarType === 'SOLAR' ? '양력' : user?.calendarType === 'LUNAR' ? '음력' : '';
  const birthDateDisplay = user?.birthDate
    ? `${formattedBirthDate}${calendarLabel ? ` (${calendarLabel})` : ''}${user?.birthTime ? ` ${user.birthTime}` : ''}`
    : '미설정';
  const genderLabel = user?.gender === 'MALE' ? '남성' : user?.gender === 'FEMALE' ? '여성' : '미설정';
  const bloodTypeLabel = user?.bloodType ? `${user.bloodType}형` : '미설정';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <SettingsHeader title="프로필 관리" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Avatar + Name */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: tintColor + '15' }]}>
            <IconSymbol name="person.fill" size={40} color={tintColor} />
          </View>
          <Text style={[styles.userName, { color: textColor }]}>
            {user?.name || '이름 미설정'}
          </Text>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: textSecondary }]}>기본 정보</Text>
          <View style={[styles.card, { backgroundColor: surfaceColor }, Shadows.sm]}>
            <ProfileRow
              icon="pencil"
              iconColor={tintColor}
              title="이름"
              value={user?.name || '미설정'}
              onPress={() => router.push('/settings/name')}
            />
            <ProfileRow
              icon="at"
              iconColor={tintColor}
              title="닉네임"
              value={user?.nickname || '미설정'}
              onPress={() => router.push('/settings/nickname')}
            />
            <ProfileRow
              icon="person.fill"
              iconColor={tintColor}
              title="성별"
              value={genderLabel}
              onPress={() => router.push('/settings/gender')}
            />
            <ProfileRow
              icon="calendar"
              iconColor={tintColor}
              title="생년월일"
              value={birthDateDisplay}
              onPress={() => router.push('/settings/birthdate')}
              isLast
            />
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: textSecondary }]}>추가 정보</Text>
          <View style={[styles.card, { backgroundColor: surfaceColor }, Shadows.sm]}>
            <ProfileRow
              icon="briefcase.fill"
              iconColor="#C9956B"
              title="직업"
              value={user?.occupation || '미설정'}
              onPress={() => router.push('/settings/occupation')}
            />
            <ProfileRow
              icon="brain"
              iconColor="#7B6B8A"
              title="MBTI"
              value={user?.mbti || '미설정'}
              onPress={() => router.push('/settings/mbti')}
            />
            <ProfileRow
              icon="drop.fill"
              iconColor="#C75C5C"
              title="혈액형"
              value={bloodTypeLabel}
              onPress={() => router.push('/settings/bloodtype')}
            />
            <ProfileRow
              icon="star.fill"
              iconColor="#5B9A6F"
              title="관심사"
              value={user?.interests || '미설정'}
              onPress={() => router.push('/settings/interests')}
              isLast
            />
          </View>
        </View>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: FontSizes.xs,
  },
  rowValue: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    marginTop: 1,
  },
});
