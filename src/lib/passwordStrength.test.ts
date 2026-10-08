import { passwordStrength } from './passwordStrength'

test('short or simple passwords are Weak', () => {
  expect(passwordStrength('abc')).toBe('Weak')
  expect(passwordStrength('abc1!')).toBe('Weak') // mixed but short
  expect(passwordStrength('averylongpassword')).toBe('Weak') // long but letters only
  expect(passwordStrength('averylongpassword99')).toBe('Weak') // no symbol
})

test('long passwords with letters, numbers and symbols are Strong', () => {
  expect(passwordStrength('Correct-Horse-Battery-9')).toBe('Strong')
})
