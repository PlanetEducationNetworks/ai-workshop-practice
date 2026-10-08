import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupPage, passwordStrength } from './SignupPage'

test('no strength is shown before a password is typed', () => {
  render(<SignupPage />)
  expect(screen.queryByText(/password strength/i)).not.toBeInTheDocument()
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

test('a long password missing numbers or symbols is still Weak', () => {
  expect(passwordStrength('correcthorsebattery')).toBe('Weak')
  expect(passwordStrength('correct-horse-battery')).toBe('Weak')
  expect(passwordStrength('correcthorse99')).toBe('Weak')
  expect(passwordStrength('Sh0rt-pw!')).toBe('Weak')
  expect(passwordStrength('correct-horse-9')).toBe('Strong')
})
