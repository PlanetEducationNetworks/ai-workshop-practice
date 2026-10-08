import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupPage } from './SignupPage'

test('a short, simple password is Weak', async () => {
  render(<SignupPage />)
  await userEvent.type(screen.getByLabelText('Password'), 'password')
  expect(await screen.findByText('Weak')).toBeInTheDocument()
})

test('a long password with letters, numbers and symbols is Strong', async () => {
  render(<SignupPage />)
  await userEvent.type(screen.getByLabelText('Password'), 'correct-horse-42!')
  expect(await screen.findByText('Strong')).toBeInTheDocument()
})

test('nothing is shown until a password is typed', () => {
  render(<SignupPage />)
  expect(screen.queryByText('Weak')).not.toBeInTheDocument()
  expect(screen.queryByText('Strong')).not.toBeInTheDocument()
})
