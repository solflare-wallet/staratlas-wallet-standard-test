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
    base: '/',
    resolve: { alias: { '~': path.resolve(__dirname, './src') } },
    envDir: path.resolve(__dirname, '../../'),
  },
) satisfies UserConfig;
