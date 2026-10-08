import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupPage } from './SignupPage'

test('no strength is shown before typing a password', () => {
  render(<SignupPage />)
  expect(screen.queryByText(/Password strength/)).not.toBeInTheDocument()
})

test.each(['abc', 'a1!', 'onlylettersbutlong', 'letters1234567890'])(
  'a short or simple password (%s) shows Weak',
  async password => {
    render(<SignupPage />)
    await userEvent.type(screen.getByLabelText('Password'), password)
    expect(screen.getByText('Password strength: Weak')).toBeInTheDocument()
  }
)

test('a long password with letters, numbers and symbols shows Strong', async () => {
  render(<SignupPage />)
  await userEvent.type(screen.getByLabelText('Password'), 'Correct-Horse-Battery-9')
  expect(screen.getByText('Password strength: Strong')).toBeInTheDocument()
  expect(screen.getByLabelText('Password')).toHaveAccessibleDescription('Password strength: Strong')
})
