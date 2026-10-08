import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupPage, passwordStrength } from './SignupPage'

test('no strength is shown before a password is typed', () => {
  render(<SignupPage />)
  expect(screen.queryByText(/Password strength/)).not.toBeInTheDocument()
})

test('a short password shows Weak under the password field', async () => {
  render(<SignupPage />)
  await userEvent.type(screen.getByLabelText('Password'), 'abc')
  expect(screen.getByText('Password strength: Weak')).toBeInTheDocument()
})

test('a long password with letters, numbers and symbols shows Strong', async () => {
  render(<SignupPage />)
  await userEvent.type(screen.getByLabelText('Password'), 'Correct-Horse-Battery-9')
  expect(screen.getByText('Password strength: Strong')).toBeInTheDocument()
})

test.each([
  ['short even if mixed', 'Ab1!'],
  ['long but letters only', 'correcthorsebattery'],
  ['long but no symbol', 'correcthorse99'],
  ['long but no number', 'correct-horse-battery'],
  ['long but no letter', '1234-5678-9012'],
])('a %s password is Weak', (_, password) => {
  expect(passwordStrength(password)).toBe('Weak')
})

test('12 characters with letters, numbers and symbols is Strong', () => {
  expect(passwordStrength('abcdefghi1!x')).toBe('Strong')
})
