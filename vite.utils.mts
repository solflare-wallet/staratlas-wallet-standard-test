import { crx, ManifestV3Export } from '@crxjs/vite-plugin';
import autoprefixer from 'autoprefixer';
import autoExternal from 'rollup-plugin-auto-external';
import cleanupPlugin from 'rollup-plugin-cleanup';
import tailwindcss from 'tailwindcss';
import { BuildOptions, defineConfig, UserConfig } from 'vite';
import dtsPlugin from 'vite-plugin-dts';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import solidPlugin from 'vite-plugin-solid';
import solidSvgPlugin from 'vite-plugin-solid-svg';

export const cleanupConfig: UserConfig = {
  build: {
    rollupOptions: {
      plugins: [
        cleanupPlugin({
          comments: [],
          extensions: ['js', 'jsx', 'mjs', 'ts', 'tsx', 'mts'],
        }),
      ],
    },
  },
};
export const solidConfig: UserConfig = {
  plugins: [solidPlugin(), solidSvgPlugin({ svgo: {} })],
};
export const libConfig = (entryName: string): UserConfig =>
  defineConfig({
    plugins: [dtsPlugin({ rollupTypes: true })],
    build: {
      rollupOptions: {
        plugins: [autoExternal()],
        external: [
          'solid-js',
          'solid-js/web',
          'solid-js/store',
          'solid-js/jsx-runtime',
          'react',
          'react/jsx-runtime',
        ],
      },
      lib: {
        entry: entryName,
        formats: ['es', 'cjs'],
        fileName: (format) => `dist.${format}.js`,
      },
      target: 'esnext',
      sourcemap: true,
      emptyOutDir: true,
    },
  });
export const tailwindConfig: UserConfig = {
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
};
export const extensionConfig = (manifest: ManifestV3Export): UserConfig => ({
  plugins: [crx({ manifest })],
});
export const polyfillConfig: UserConfig = {
  plugins: [nodePolyfills()],
};

/**
 * Will overwrite with later values.
 * Not completely correct, may need to update if some combine wrong.
 * @param configs - The configs to combine.
 */
export function combineConfigs(...configs: UserConfig[]): UserConfig {
  return configs.reduce((acc, config) => {
    acc.root = config.root ?? acc.root;
    acc.base = config.base ?? acc.base;
    acc.mode = config.mode ?? acc.mode;
    acc.cacheDir = config.cacheDir ?? acc.cacheDir;
    acc.define = { ...acc.define, ...config.define };
    if (config.plugins !== undefined) {
      acc.plugins = [...(acc.plugins ?? []), ...config.plugins];
    }
    acc.resolve = combineResolve(acc.resolve, config.resolve);
    acc.html = combineHtml(acc.html, config.html);
    acc.css = combineCss(acc.css, config.css);
    acc.json = combineJson(acc.json, config.json);
    if (config.assetsInclude !== undefined) {
      if (acc.assetsInclude === undefined) {
        acc.assetsInclude = normalizeArray(config.assetsInclude);
      } else {
        acc.assetsInclude = [
          ...normalizeArray(acc.assetsInclude),
          ...normalizeArray(config.assetsInclude),
        ];
      }
    }
    acc.esbuild = combineEsbuild(acc.esbuild, config.esbuild);
    acc.server = combineServer(acc.server, config.server);
    acc.build = combineBuild(acc.build, config.build);
    acc.preview = combinePreview(acc.preview, config.preview);
    acc.optimizeDeps = combineOptimizeDeps(
      acc.optimizeDeps,
      config.optimizeDeps,
    );
    acc.ssr = combineSsr(acc.ssr, config.ssr);
    acc.experimental = combineExperimental(
      acc.experimental,
      config.experimental,
    );
    acc.legacy = combineLegacy(acc.legacy, config.legacy);
    acc.logLevel = config.logLevel ?? acc.logLevel;
    acc.customLogger = config.customLogger ?? acc.customLogger;
    acc.clearScreen = config.clearScreen ?? acc.clearScreen;
    acc.envDir = config.envDir ?? acc.envDir;
    if (config.envPrefix !== undefined) {
      acc.envPrefix = [
        ...normalizeArray(acc.envPrefix),
        ...normalizeArray(config.envPrefix),
      ];
    }
    acc.worker = combineWorker(acc.worker, config.worker);
    acc.appType = config.appType ?? acc.appType;

    return acc;
  }, {});
}

function normalizeArray<T>(value: T | T[] | undefined): T[] {
  return Array.isArray(value) ? value : value === undefined ? [] : [value];
}

function combineResolve(
  c1?: UserConfig['resolve'],
  c2?: UserConfig['resolve'],
): UserConfig['resolve'] {
  return {
    ...c1,
    ...c2,
    alias: { ...c1?.alias, ...c2?.alias },
  };
}

function combineHtml(
  c1?: UserConfig['html'],
  c2?: UserConfig['html'],
): UserConfig['html'] {
  return {
    ...c1,
    ...c2,
  };
}

function combineCss(
  c1?: UserConfig['css'],
  c2?: UserConfig['css'],
): UserConfig['css'] {
  return {
    ...c1,
    ...c2,
  };
}

function combineJson(
  c1?: UserConfig['json'],
  c2?: UserConfig['json'],
): UserConfig['json'] {
  return {
    ...c1,
    ...c2,
  };
}

function combineEsbuild(
  c1?: UserConfig['esbuild'],
  c2?: UserConfig['esbuild'],
): UserConfig['esbuild'] {
  return {
    ...c1,
    ...c2,
  };
}

function combineServer(
  c1?: UserConfig['server'],
  c2?: UserConfig['server'],
): UserConfig['server'] {
  return {
    ...c1,
    ...c2,
  };
}

function combineBuild(
  c1?: UserConfig['build'],
  c2?: UserConfig['build'],
): UserConfig['build'] {
  return {
    ...c1,
    ...c2,
    rollupOptions: combineRollupOptions(c1?.rollupOptions, c2?.rollupOptions),
  };
}

function combineRollupOptions(
  c1?: BuildOptions['rollupOptions'],
  c2?: BuildOptions['rollupOptions'],
): BuildOptions['rollupOptions'] {
  return {
    ...c1,
    ...c2,
    plugins: combineRollupPlugins(c1?.plugins, c2?.plugins),
  };
}

function combineRollupPlugins(
  c1?: Required<BuildOptions>['rollupOptions']['plugins'],
  c2?: Required<BuildOptions>['rollupOptions']['plugins'],
): Required<BuildOptions>['rollupOptions']['plugins'] {
  return [c1, c2];
}

function combinePreview(
  c1?: UserConfig['preview'],
  c2?: UserConfig['preview'],
): UserConfig['preview'] {
  return {
    ...c1,
    ...c2,
  };
}

function combineOptimizeDeps(
  c1?: UserConfig['optimizeDeps'],
  c2?: UserConfig['optimizeDeps'],
): UserConfig['optimizeDeps'] {
  return {
    ...c1,
    ...c2,
  };
}

function combineSsr(
  c1?: UserConfig['ssr'],
  c2?: UserConfig['ssr'],
): UserConfig['ssr'] {
  return {
    ...c1,
    ...c2,
  };
}

function combineExperimental(
  c1?: UserConfig['experimental'],
  c2?: UserConfig['experimental'],
): UserConfig['experimental'] {
  return {
    ...c1,
    ...c2,
  };
}

function combineLegacy(
  c1?: UserConfig['legacy'],
  c2?: UserConfig['legacy'],
): UserConfig['legacy'] {
  return {
    ...c1,
    ...c2,
  };
}

function combineWorker(
  c1?: UserConfig['worker'],
  c2?: UserConfig['worker'],
): UserConfig['worker'] {
  return {
    ...c1,
    ...c2,
  };
}
