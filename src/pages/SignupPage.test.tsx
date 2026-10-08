import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupPage } from './SignupPage'
import { passwordStrength } from '../lib/passwordStrength'

test('password strength rules', () => {
  expect(passwordStrength('')).toBeNull()
  expect(passwordStrength('abc')).toBe('Weak')
  expect(passwordStrength('abcdefghijklmnop')).toBe('Weak')
  expect(passwordStrength('abc123!')).toBe('Weak')
  expect(passwordStrength('Correct-Horse-Battery-9')).toBe('Strong')
})

test('no strength is shown before typing a password', () => {
  render(<SignupPage />)
  expect(screen.queryByText(/weak|strong/i)).not.toBeInTheDocument()
})

test('the strength shows under the password field', async () => {
  render(<SignupPage />)
  const password = screen.getByLabelText('Password')
  await userEvent.type(password, 'abc')
  expect(password).toHaveAccessibleDescription('Password strength: Weak')
  await userEvent.clear(password)
  await userEvent.type(password, 'Correct-Horse-Battery-9')
  expect(password).toHaveAccessibleDescription('Password strength: Strong')
})
