import * as Sharing from 'expo-sharing';
import { Platform, Share } from 'react-native';
import type { Fortune } from '@/types/fortune';
import { CATEGORY_LABELS } from '@/types/fortune';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export interface ShareContent {
  message: string;
  title: string;
  url?: string;
}

function formatFortuneMessage(fortune: Fortune): string {
  const date = format(new Date(fortune.date), 'M월 d일 (EEEE)', { locale: ko });

  let message = `${date} 오늘의 예감\n\n`;
  message += `총운: ${fortune.overallScore}점\n`;
  message += `${fortune.overallMessage}\n\n`;

  fortune.categories.forEach((cat) => {
    message += `${CATEGORY_LABELS[cat.category]}: ${cat.score}점\n`;
  });

  message += `\n행운의 색: ${fortune.luckyColor}`;
  message += `\n행운의 숫자: ${fortune.luckyNumber}`;
  message += `\n행운의 아이템: ${fortune.luckyItem}`;
  message += `\n\n오늘의 운세 앱에서 확인하세요!`;

  return message;
}

export const shareService = {
  async canShare(): Promise<boolean> {
    return Sharing.isAvailableAsync();
  },

  async shareFortune(fortune: Fortune): Promise<boolean> {
    const message = formatFortuneMessage(fortune);

    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: '오늘의 운세',
            text: message,
          });
          return true;
        }
        await navigator.clipboard.writeText(message);
        return true;
      }

      const result = await Share.share({
        message,
        title: '오늘의 운세',
      });

      return result.action === Share.sharedAction;
    } catch (error) {
      console.error('Error sharing fortune:', error);
      return false;
    }
  },

  async shareImage(imageUri: string): Promise<boolean> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        return false;
      }

      await Sharing.shareAsync(imageUri, {
        mimeType: 'image/png',
        dialogTitle: '운세 공유하기',
      });

      return true;
    } catch (error) {
      console.error('Error sharing image:', error);
      return false;
    }
  },
};
