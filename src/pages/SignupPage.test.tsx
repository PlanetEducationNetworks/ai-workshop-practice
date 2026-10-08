import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupPage } from './SignupPage'

test('password strength is hidden until the user types a password', () => {
  render(<SignupPage />)
  expect(screen.queryByText(/Password strength/)).not.toBeInTheDocument()
})

test('password strength shows Weak then Strong under the password field', async () => {
  render(<SignupPage />)
  const password = screen.getByLabelText('Password')

  await userEvent.type(password, 'abc')
  expect(screen.getByText('Password strength: Weak')).toBeInTheDocument()

  await userEvent.type(password, 'defg123!@')
  expect(screen.getByText('Password strength: Strong')).toBeInTheDocument()
  expect(screen.queryByText('Password strength: Weak')).not.toBeInTheDocument()
})
