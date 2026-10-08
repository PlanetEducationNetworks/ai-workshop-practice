import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupPage } from './SignupPage'

const strength = () => screen.getByText(/^Password strength:/)

test('no strength is shown until something is typed', () => {
  render(<SignupPage />)
  expect(screen.queryByText(/^Password strength:/)).not.toBeInTheDocument()
})

test('a short password is weak', async () => {
  render(<SignupPage />)
  await userEvent.type(screen.getByLabelText('Password'), 'abc')
  expect(strength()).toHaveTextContent('Password strength: Weak')
})

test('a long password of one kind of character is still weak', async () => {
  render(<SignupPage />)
  await userEvent.type(screen.getByLabelText('Password'), 'passwordpassword')
  expect(strength()).toHaveTextContent('Password strength: Weak')
})

test('a medium password mixes two kinds of character', async () => {
  render(<SignupPage />)
  await userEvent.type(screen.getByLabelText('Password'), 'password9')
  expect(strength()).toHaveTextContent('Password strength: Medium')
})

test('a long password with letters, numbers and symbols is strong', async () => {
  render(<SignupPage />)
  await userEvent.type(screen.getByLabelText('Password'), 'Correct-Horse-Battery-9')
  expect(strength()).toHaveTextContent('Password strength: Strong')
})

test('the strength message is tied to the password field', async () => {
  render(<SignupPage />)
  await userEvent.type(screen.getByLabelText('Password'), 'abc')
  expect(screen.getByLabelText('Password')).toHaveAccessibleDescription('Password strength: Weak')
  expect(screen.getByLabelText('Password')).not.toHaveAttribute('aria-invalid')
})

async function signUp(fields: { name?: string; email?: string }) {
  render(<SignupPage />)
  if (fields.name) await userEvent.type(screen.getByLabelText('Name'), fields.name)
  if (fields.email) await userEvent.type(screen.getByLabelText('Email'), fields.email)
  await userEvent.type(screen.getByLabelText('Password'), 'Correct-Horse-Battery-9')
  await userEvent.click(screen.getByRole('button', { name: 'Sign up' }))
}

test('signing up confirms the account and shows it as a pass', async () => {
  await signUp({ name: 'Ayesha Rahman', email: 'ayesha@edupay.test' })
  expect(screen.getByRole('heading', { name: 'Account created' })).toBeInTheDocument()
  expect(screen.getByText('Ayesha Rahman')).toBeInTheDocument()
  expect(screen.getByText('ayesha@edupay.test')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument()
  expect(screen.queryByLabelText('Password')).not.toBeInTheDocument()
})

test('with no name, the pass falls back to the email', async () => {
  await signUp({ email: 'ayesha@edupay.test' })
  expect(screen.getByText('ayesha@edupay.test')).toBeInTheDocument()
})
