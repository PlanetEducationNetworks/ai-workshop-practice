import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupPage, passwordStrength } from './SignupPage'

test('no strength is shown before typing a password', () => {
  render(<SignupPage />)
  expect(screen.queryByText(/Password strength/)).not.toBeInTheDocument()
})

test('a short password shows Weak under the password field', async () => {
  render(<SignupPage />)
  await userEvent.type(screen.getByLabelText('Password'), 'abc')
  expect(screen.getByText('Password strength: Weak')).toBeInTheDocument()
  expect(screen.getByLabelText('Password')).toHaveAccessibleDescription('Password strength: Weak')
})

test('a long password with letters, numbers and symbols shows Strong', async () => {
  render(<SignupPage />)
  await userEvent.type(screen.getByLabelText('Password'), 'Correct-Horse-Battery-9')
  expect(screen.getByText('Password strength: Strong')).toBeInTheDocument()
})

test('passwordStrength rules', () => {
  expect(passwordStrength('abc')).toBe('Weak')
  expect(passwordStrength('abcdefghijklmnop')).toBe('Weak')
  expect(passwordStrength('abcdefg1')).toBe('Medium')
  expect(passwordStrength('abcdefghij12')).toBe('Medium')
  expect(passwordStrength('abcdefghi1!x')).toBe('Strong')
})
