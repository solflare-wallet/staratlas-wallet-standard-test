import base from '../../.prettierrc.mjs';

/**
 * @type {import('prettier').Options}
 */
export default {
  ...base,
  plugins: [...base.plugins, 'prettier-plugin-tailwindcss'],
  tailwindConfig: './tailwind.config.ts',
};
