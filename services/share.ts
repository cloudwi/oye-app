import { Platform, Share } from 'react-native';
import type { Fortune } from '@/types/fortune';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export const shareService = {
  async shareFortune(fortune: Fortune): Promise<boolean> {
    const date = format(new Date(fortune.date), 'yyyy년 M월 d일', { locale: ko });
    const APP_STORE_URL = 'https://apps.apple.com/app/id6759439435';
    const message = `\u{1F52E} 오늘의 예감\n\u{1F4C5} ${date}\n\n${fortune.content}\n\n\u{1F517} 앱 다운로드: ${APP_STORE_URL}`;

    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: '오늘의 예감',
            text: message,
          });
          return true;
        }
        await navigator.clipboard.writeText(message);
        return true;
      }

      const result = await Share.share({
        message,
        title: '오늘의 예감',
      });

      return result.action === Share.sharedAction;
    } catch (error) {
      console.error('Error sharing fortune:', error);
      return false;
    }
  },
};
