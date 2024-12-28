import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'no-console': 'warn',
    'no-top-level-await': 'warn',
  },
})
