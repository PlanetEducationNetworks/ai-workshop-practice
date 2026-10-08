import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupPage } from './SignupPage'

test('shows no strength before typing a password', () => {
  render(<SignupPage />)
  expect(screen.queryByText(/weak|strong/i)).not.toBeInTheDocument()
})

test('a short password shows Weak', async () => {
  render(<SignupPage />)
  await userEvent.type(screen.getByLabelText('Password'), 'abc')
  expect(screen.getByText('Weak')).toBeInTheDocument()
})

test('a long password with only letters shows Weak', async () => {
  render(<SignupPage />)
  await userEvent.type(screen.getByLabelText('Password'), 'abcdefghijklmnop')
  expect(screen.getByText('Weak')).toBeInTheDocument()
})

test('a long password with letters, numbers and symbols shows Strong', async () => {
  render(<SignupPage />)
  await userEvent.type(screen.getByLabelText('Password'), 'Correct-Horse-Battery-9')
  expect(screen.getByText('Strong')).toBeInTheDocument()
})
