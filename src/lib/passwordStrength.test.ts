import { passwordStrength } from './passwordStrength'

test.each([
  ['', 'Weak'],
  ['abc', 'Weak'],
  ['abcdefghijklmnop', 'Weak'],
  ['password1', 'Medium'],
  ['Abc-1234', 'Medium'],
  ['abcdefghijk1!', 'Strong'],
  ['Correct-Horse-Battery-9', 'Strong'],
])('%j is %s', (password, expected) => {
  expect(passwordStrength(password)).toBe(expected)
})
