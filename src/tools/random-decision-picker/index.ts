import { Confetti } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.random-decision-picker.title'),
  path: '/random-decision-picker',
  description: translate('tools.random-decision-picker.description'),
  keywords: ['random', 'decision', 'picker', 'wheel', 'spin', 'lottery', 'choice', '随机', '转盘', '抽奖', '决定', '选择'],
  component: () => import('./random-decision-picker.vue'),
  icon: Confetti,
  createdAt: new Date('2026-05-13'),
});
