import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupPage, passwordStrength } from './SignupPage'

test('password strength rules', () => {
  expect(passwordStrength('abc')).toBe('Weak')
  expect(passwordStrength('abcdefghijklmnop')).toBe('Weak')
  expect(passwordStrength('abcdefgh1234')).toBe('Weak')
  expect(passwordStrength('abcdefg123!@')).toBe('Strong')
})

test('signup page shows Weak then Strong under the password field', async () => {
  render(<SignupPage />)
  const password = screen.getByLabelText('Password')
  expect(screen.queryByText(/Password strength/)).not.toBeInTheDocument()
  await userEvent.type(password, 'abc')
  expect(screen.getByText('Password strength: Weak')).toBeInTheDocument()
  await userEvent.type(password, 'defg123!@')
  expect(screen.getByText('Password strength: Strong')).toBeInTheDocument()
})
