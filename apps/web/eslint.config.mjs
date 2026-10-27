import base from '@grn/config/eslint'
import astro from 'eslint-plugin-astro'

export default [
  ...base,
  ...astro.configs.recommended,
  { ignores: ['worker-configuration.d.ts'] },
]
