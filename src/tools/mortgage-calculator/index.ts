import { BuildingBank } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.mortgage-calculator.title'),
  path: '/mortgage-calculator',
  description: translate('tools.mortgage-calculator.description'),
  keywords: ['mortgage', 'calculator', 'loan', 'house', 'home', '房贷', '贷款', '月供', '公积金', '利率'],
  component: () => import('./mortgage-calculator.vue'),
  icon: BuildingBank,
  createdAt: new Date('2026-05-13'),
});
