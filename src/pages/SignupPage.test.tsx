import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupPage } from './SignupPage'

async function typePassword(value: string) {
  render(<SignupPage />)
  await userEvent.type(screen.getByLabelText('Password'), value)
}

test('shows nothing while the password is empty', () => {
  render(<SignupPage />)
  expect(screen.queryByText('Weak')).not.toBeInTheDocument()
  expect(screen.queryByText('Strong')).not.toBeInTheDocument()
})

test('a short or simple password is Weak', async () => {
  await typePassword('abc123')
  expect(screen.getByText('Weak')).toBeInTheDocument()
})

test('a long password with letters, numbers and symbols is Strong', async () => {
  await typePassword('correct-horse-9!')
  expect(screen.getByText('Strong')).toBeInTheDocument()
})
