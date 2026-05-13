import { ReportMoney } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.income-tax-calculator.title'),
  path: '/income-tax-calculator',
  description: translate('tools.income-tax-calculator.description'),
  keywords: ['income tax', 'tax', 'calculator', 'salary', '个人所得税', '所得税', '薪资', '工资', '纳税', '五险一金'],
  component: () => import('./income-tax-calculator.vue'),
  icon: ReportMoney,
  createdAt: new Date('2026-05-13'),
});
