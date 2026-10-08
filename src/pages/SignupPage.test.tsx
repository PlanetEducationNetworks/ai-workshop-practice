import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupPage, passwordStrength } from './SignupPage'

test('short or simple passwords are Weak', () => {
  expect(passwordStrength('abc')).toBe('Weak')
  expect(passwordStrength('abcdefghijklmnop')).toBe('Weak')
  expect(passwordStrength('abcdefgh1234')).toBe('Weak')
})

test('long password with letters, numbers and symbols is Strong', () => {
  expect(passwordStrength('correct-horse-42')).toBe('Strong')
})

test('the signup page shows the strength under the password field', async () => {
  render(<SignupPage />)
  const password = screen.getByLabelText('Password')
  await userEvent.type(password, 'abc')
  expect(screen.getByText('Password strength: Weak')).toBeInTheDocument()
  await userEvent.type(password, 'defgh-1234!')
  expect(screen.getByText('Password strength: Strong')).toBeInTheDocument()
})
