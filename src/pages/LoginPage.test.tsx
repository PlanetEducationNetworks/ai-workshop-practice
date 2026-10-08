import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginPage } from './LoginPage'

async function logIn(email: string, password: string) {
  const emailBox = screen.getByLabelText('Email')
  const passwordBox = screen.getByLabelText('Password')
  await userEvent.clear(emailBox)
  await userEvent.clear(passwordBox)
  if (email) await userEvent.type(emailBox, email)
  if (password) await userEvent.type(passwordBox, password)
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
}

test('a correct login shows the welcome message', async () => {
  render(<LoginPage />)
  await logIn('demo@edupay.test', 'correct-horse')
  expect(await screen.findByText('Welcome, Demo Student!')).toBeInTheDocument()
})

test('a correct login shows no error', async () => {
  render(<LoginPage />)
  await logIn('demo@edupay.test', 'correct-horse')
  await screen.findByText('Welcome, Demo Student!')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('no error is shown before the form is submitted', () => {
  render(<LoginPage />)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('a wrong password shows an error', async () => {
  render(<LoginPage />)
  await logIn('demo@edupay.test', 'wrong-password')
  expect(await screen.findByRole('alert')).toHaveTextContent('Wrong email or password.')
  expect(screen.queryByText(/Welcome/)).not.toBeInTheDocument()
})

test('a wrong password keeps the form on screen and marks the password invalid', async () => {
  render(<LoginPage />)
  await logIn('demo@edupay.test', 'wrong-password')
  await screen.findByRole('alert')
  expect(screen.getByLabelText('Password')).toBeInvalid()
  expect(screen.getByLabelText('Password')).toHaveAccessibleDescription('Wrong email or password.')
  expect(screen.getByLabelText('Email')).toHaveValue('demo@edupay.test')
})

test('an unknown email shows an error', async () => {
  render(<LoginPage />)
  await logIn('nobody@edupay.test', 'correct-horse')
  expect(await screen.findByRole('alert')).toHaveTextContent('Wrong email or password.')
})

test('empty fields show an error', async () => {
  render(<LoginPage />)
  await logIn('', '')
  expect(await screen.findByRole('alert')).toHaveTextContent('Wrong email or password.')
})

test('the password match is case-sensitive', async () => {
  render(<LoginPage />)
  await logIn('demo@edupay.test', 'Correct-Horse')
  expect(await screen.findByRole('alert')).toBeInTheDocument()
})

test('the error stays after a second wrong attempt', async () => {
  render(<LoginPage />)
  await logIn('demo@edupay.test', 'wrong-1')
  await screen.findByRole('alert')
  await logIn('demo@edupay.test', 'wrong-2')
  expect(await screen.findByRole('alert')).toHaveTextContent('Wrong email or password.')
  expect(screen.getAllByRole('alert')).toHaveLength(1)
})

test('logging in correctly after a wrong attempt works and clears the error', async () => {
  render(<LoginPage />)
  await logIn('demo@edupay.test', 'wrong-password')
  await screen.findByRole('alert')
  await logIn('demo@edupay.test', 'correct-horse')
  expect(await screen.findByText('Welcome, Demo Student!')).toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
