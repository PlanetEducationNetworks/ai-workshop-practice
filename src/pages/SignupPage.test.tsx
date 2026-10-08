import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupPage } from './SignupPage'

test('no strength is shown before typing a password', () => {
  render(<SignupPage />)
  expect(screen.queryByText(/password strength/i)).not.toBeInTheDocument()
})

test('a short password shows Weak under the password field', async () => {
  render(<SignupPage />)
  await userEvent.type(screen.getByLabelText('Password'), 'abc')
  expect(screen.getByLabelText('Password')).toHaveAccessibleDescription('Password strength: Weak')
})

test('a long mixed password shows Strong under the password field', async () => {
  render(<SignupPage />)
  await userEvent.type(screen.getByLabelText('Password'), 'Correct-Horse-Battery-9')
  expect(screen.getByLabelText('Password')).toHaveAccessibleDescription('Password strength: Strong')
})
