import { Palette } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.color-palette-generator.title'),
  path: '/color-palette-generator',
  description: translate('tools.color-palette-generator.description'),
  keywords: ['color', 'palette', 'generator', 'tints', 'shades', 'hue', 'complementary', 'analogous', 'triadic', 'design'],
  component: () => import('./color-palette-generator.vue'),
  icon: Palette,
  createdAt: new Date('2026-05-13'),
});
