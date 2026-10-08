import { passwordStrength } from './passwordStrength'

test('short passwords are weak', () => {
  expect(passwordStrength('abc')).toBe('Weak')
  expect(passwordStrength('ab1!')).toBe('Weak')
})

test('long passwords missing a letter, number or symbol are weak', () => {
  expect(passwordStrength('abcdefghijklmnop')).toBe('Weak')
  expect(passwordStrength('abcdefgh1234')).toBe('Weak')
  expect(passwordStrength('abcdefgh!@#$')).toBe('Weak')
  expect(passwordStrength('12345678!@#$')).toBe('Weak')
})

test('12+ characters with a letter, number and symbol is strong', () => {
  expect(passwordStrength('abcdefg123!@')).toBe('Strong')
  expect(passwordStrength('Correct-Horse-Battery-9')).toBe('Strong')
})
