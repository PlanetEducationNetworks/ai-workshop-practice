import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupPage } from './SignupPage'

test('shows no strength until a password is typed', () => {
  render(<SignupPage />)
  expect(screen.queryByText(/Password strength/)).not.toBeInTheDocument()
})

test.each([
  ['abc', 'Weak'],
  ['password1', 'Medium'],
  ['Correct-Horse-Battery-9', 'Strong'],
])('typing %j shows %s under the password field', async (password, strength) => {
  render(<SignupPage />)
  await userEvent.type(screen.getByLabelText('Password'), password)
  expect(screen.getByText(`Password strength: ${strength}`)).toBeInTheDocument()
  expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(`Password strength: ${strength}`)
})

test('a weak password blocks signup and shows an error', async () => {
  render(<SignupPage />)
  await userEvent.type(screen.getByLabelText('Email'), 'new@edupay.test')
  await userEvent.type(screen.getByLabelText('Password'), 'abc')
  await userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Use at least 8 characters')
  expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true')
  expect(screen.queryByText(/Account created/)).not.toBeInTheDocument()

  await userEvent.type(screen.getByLabelText('Password'), '-Horse-9')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('a strong password creates the account', async () => {
  render(<SignupPage />)
  await userEvent.type(screen.getByLabelText('Name'), 'Ada')
  await userEvent.type(screen.getByLabelText('Password'), 'Correct-Horse-Battery-9')
  await userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
  expect(screen.getByText('Account created for Ada!')).toBeInTheDocument()
})
