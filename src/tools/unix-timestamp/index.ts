import { Clock } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.unix-timestamp.title'),
  path: '/unix-timestamp',
  description: translate('tools.unix-timestamp.description'),
  keywords: ['unix', 'timestamp', 'epoch', 'time', 'convert', 'date', 'seconds', 'milliseconds'],
  component: () => import('./unix-timestamp.vue'),
  icon: Clock,
  createdAt: new Date('2026-05-13'),
});
