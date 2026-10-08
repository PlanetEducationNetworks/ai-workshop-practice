import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupPage } from './SignupPage'
import { passwordStrength } from '../lib/passwordStrength'

test('no strength is shown before typing a password', () => {
  render(<SignupPage />)
  expect(screen.queryByText(/password strength/i)).not.toBeInTheDocument()
})

test('a short password shows Weak under the password field', async () => {
  render(<SignupPage />)
  await userEvent.type(screen.getByLabelText('Password'), 'abc')
  expect(screen.getByLabelText('Password')).toHaveAccessibleDescription('Password strength: Weak')
})

test('a long password with letters, numbers and symbols shows Strong', async () => {
  render(<SignupPage />)
  await userEvent.type(screen.getByLabelText('Password'), 'Correct-Horse-Battery-9')
  expect(screen.getByLabelText('Password')).toHaveAccessibleDescription('Password strength: Strong')
})

test.each([
  ['abc', 'Weak'],
  ['abcdefghijklmnop', 'Weak'], // long but letters only
  ['abcdefghij1234', 'Weak'], // no symbol
  ['Ab1!', 'Weak'], // mixed but short
  ['Correct-Horse-Battery-9', 'Strong'],
])('passwordStrength(%j) is %s', (password, expected) => {
  expect(passwordStrength(password)).toBe(expected)
})
