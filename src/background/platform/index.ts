import type { PlatformAdapter, PlatformName } from '../../shared/types';
import { greenhouseAdapter } from './greenhouse';
import { leverAdapter } from './lever';
import { workdayAdapter } from './workday';

export { greenhouseAdapter, leverAdapter, workdayAdapter };

export const platformAdapters: PlatformAdapter[] = [
  greenhouseAdapter,
  leverAdapter,
  workdayAdapter,
];

export const getPlatformAdapter = (platform: PlatformName): PlatformAdapter | undefined =>
  platformAdapters.find((adapter) => adapter.platform === platform);
