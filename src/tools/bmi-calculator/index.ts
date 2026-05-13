import { Ruler } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.bmi-calculator.title'),
  path: '/bmi-calculator',
  description: translate('tools.bmi-calculator.description'),
  keywords: ['bmi', 'body mass index', 'weight', 'height', 'health', 'calculator', '身体质量指数', '体重', '身高', '健康'],
  component: () => import('./bmi-calculator.vue'),
  icon: Ruler,
  createdAt: new Date('2026-05-13'),
});
