import { Platform, Share } from 'react-native';
import type { Fortune } from '@/types/fortune';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export const shareService = {
  async shareFortune(fortune: Fortune): Promise<boolean> {
    const date = format(new Date(fortune.date), 'yyyy년 M월 d일', { locale: ko });
    const message = `[오늘의 예감] ${date}\n\n${fortune.content}\n\nhttps://apps.apple.com/app/id6759439435`;

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
