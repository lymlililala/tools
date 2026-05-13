import { Numbers } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.number-formatter.title'),
  path: '/number-formatter',
  description: translate('tools.number-formatter.description'),
  keywords: ['number', 'formatter', 'thousand', 'separator', 'currency', 'scientific', 'notation', 'decimal'],
  component: () => import('./number-formatter.vue'),
  icon: Numbers,
  createdAt: new Date('2026-05-13'),
});
