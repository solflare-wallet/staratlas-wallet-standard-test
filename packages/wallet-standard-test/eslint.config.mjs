import solid from 'eslint-plugin-solid/configs/typescript';
import base from '../../eslint.config.mjs';

/**
 * @type {import('eslint').Linter.Config[]}
 */
export default [...base, solid];
