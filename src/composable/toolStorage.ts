import { useStorage } from '@vueuse/core';
import { useRoute } from 'vue-router';

/**
 * 为工具页面提供持久化存储。
 * 每个工具按路由 path 自动隔离命名空间，用户下次打开时自动恢复。
 *
 * @example
 * const storage = useToolStorage({ margin: 2, text: '' });
 * // storage.margin 和 storage.text 会自动持久化到 localStorage
 */
export function useToolStorage<T extends Record<string, unknown>>(defaults: T): T {
  const route = useRoute();
  const key = `tool-storage:${route.path}`;
  const stored = useStorage(key, { ...defaults });
  return stored.value as T;
}

/**
 * 为单个值提供持久化存储（带显式命名空间 key）。
 *
 * @example
 * const margin = useToolStorageItem('qr-code-generator:margin', 2);
 */
export function useToolStorageItem<T>(key: string, defaultValue: T) {
  return useStorage(`tool:${key}`, defaultValue);
}
