import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, FontSizes } from '@/constants/theme';

const EFFECTIVE_DATE = '2025년 2월 19일';

const SECTIONS = [
  {
    title: '1. 수집하는 개인정보',
    content: `"오늘의 예감"(이하 "앱")은 서비스 제공을 위해 아래의 개인정보를 수집합니다.

• 소셜 로그인 정보: 카카오 또는 Apple 계정의 고유 식별자(ID), 이름(닉네임)
• 직접 입력 정보: 이름, 성별, 생년월일, 양력/음력 구분
• 자동 수집 정보: 기기 정보(OS 버전, 기기 모델), 푸시 알림 토큰, 앱 사용 중 발생한 오류 정보

앱은 비밀번호, 연락처, 위치정보 등 민감한 개인정보를 수집하지 않습니다.`,
  },
  {
    title: '2. 개인정보의 수집 및 이용 목적',
    content: `수집한 개인정보는 다음의 목적으로만 이용됩니다.

• 회원 식별 및 서비스 로그인
• 생년월일, 성별 기반의 맞춤형 운세 콘텐츠 생성
• 푸시 알림 발송 (사용자가 설정한 경우)
• 앱 오류 분석 및 서비스 안정성 개선
• 서비스 이용 통계 분석 (비식별 처리)`,
  },
  {
    title: '3. 개인정보의 보유 및 이용 기간',
    content: `• 회원 탈퇴 시: 즉시 파기
• 관련 법령에 의한 보존: 전자상거래법 등 관련 법률에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관

회원 탈퇴를 요청하면 모든 개인정보를 지체 없이 파기합니다.`,
  },
  {
    title: '4. 개인정보의 제3자 제공',
    content: `앱은 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.

• 이용자가 사전에 동의한 경우
• 법령에 의해 요구되는 경우`,
  },
  {
    title: '5. 개인정보의 처리 위탁',
    content: `앱은 서비스 운영을 위해 아래의 업체에 개인정보 처리를 위탁합니다.

• 클라우드 서버 운영: Render (데이터 저장 및 처리)
• 오류 분석: Sentry (앱 오류 정보 수집)
• 푸시 알림: Expo (알림 토큰 관리 및 발송)
• AI 운세 생성: OpenAI (생년월일, 성별 기반 콘텐츠 생성, 개인 식별 불가 형태로 전달)`,
  },
  {
    title: '6. 이용자의 권리와 행사 방법',
    content: `이용자는 언제든지 다음의 권리를 행사할 수 있습니다.

• 개인정보 열람 요청
• 개인정보 수정 (앱 내 설정에서 직접 변경 가능)
• 회원 탈퇴 및 개인정보 삭제 (앱 내 설정 > 계정 탈퇴)
• 푸시 알림 수신 거부 (앱 내 설정에서 변경 가능)

위 요청은 앱 내 설정 또는 아래 연락처를 통해 가능합니다.`,
  },
  {
    title: '7. 개인정보의 안전성 확보 조치',
    content: `앱은 개인정보의 안전한 처리를 위해 다음의 조치를 취하고 있습니다.

• 인증 토큰의 암호화 저장 (iOS Keychain / Android Keystore)
• HTTPS를 통한 데이터 전송 암호화
• 접근 권한 최소화 및 JWT 기반 인증
• 비밀번호를 별도로 저장하지 않음 (소셜 로그인만 지원)`,
  },
  {
    title: '8. 개인정보 보호책임자',
    content: `• 이메일: support@oye-app.com

개인정보 관련 문의, 불만 처리, 피해 구제에 대해 위 이메일로 연락해 주시면 신속하게 처리하겠습니다.`,
  },
  {
    title: '9. 개인정보 처리방침의 변경',
    content: `본 개인정보 처리방침이 변경되는 경우, 앱 내 공지 또는 푸시 알림을 통해 사전에 안내합니다.

• 시행일: ${EFFECTIVE_DATE}`,
  },
];

export default function PrivacyScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'textSecondary');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={20} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>개인정보 처리방침</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={[styles.effectiveDate, { color: textSecondary }]}>
          시행일: {EFFECTIVE_DATE}
        </Text>

        {SECTIONS.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>{section.title}</Text>
            <Text style={[styles.sectionContent, { color: textSecondary }]}>
              {section.content}
            </Text>
          </View>
        ))}

        <View style={styles.bottomPadding} />
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  effectiveDate: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  sectionContent: {
    fontSize: FontSizes.sm,
    lineHeight: 22,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
