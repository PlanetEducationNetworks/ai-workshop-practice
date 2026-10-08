import { passwordStrength } from './passwordStrength'

test('short or simple passwords are Weak', () => {
  expect(passwordStrength('abc')).toBe('Weak')
  expect(passwordStrength('a1!')).toBe('Weak')
  expect(passwordStrength('averylongpasswordonlyletters')).toBe('Weak')
  expect(passwordStrength('longpassword1234')).toBe('Weak')
})

test('long passwords with letters, numbers and symbols are Strong', () => {
  expect(passwordStrength('Correct-Horse-Battery-9')).toBe('Strong')
  expect(passwordStrength('abcdefgh12#$')).toBe('Strong')
})
