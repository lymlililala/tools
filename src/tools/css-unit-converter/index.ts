import { Ruler } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.css-unit-converter.title'),
  path: '/css-unit-converter',
  description: translate('tools.css-unit-converter.description'),
  keywords: ['css', 'unit', 'converter', 'px', 'rem', 'em', 'vw', 'vh', 'pt', 'percent'],
  component: () => import('./css-unit-converter.vue'),
  icon: Ruler,
  createdAt: new Date('2026-05-13'),
});
