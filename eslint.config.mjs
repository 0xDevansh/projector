import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'no-console': 'warn',
    'antfu/no-top-level-await': 'off',
  },
})
