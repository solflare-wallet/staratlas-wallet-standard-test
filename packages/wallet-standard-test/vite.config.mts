import path from 'path';
import { UserConfig } from 'vite';
import {
  cleanupConfig,
  combineConfigs,
  polyfillConfig,
  solidConfig,
  tailwindConfig,
} from '../../vite.utils.mjs';

export default combineConfigs(
  solidConfig,
  tailwindConfig,
  cleanupConfig,
  polyfillConfig,
  {
    resolve: { alias: { '~': path.resolve(__dirname, './src') } },
  },
) satisfies UserConfig;
