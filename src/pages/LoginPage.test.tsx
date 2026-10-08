import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginPage } from './LoginPage'

test('a correct login shows the welcome message', async () => {
  render(<LoginPage />)
  await userEvent.type(screen.getByLabelText('Email'), 'demo@edupay.test')
  await userEvent.type(screen.getByLabelText('Password'), 'correct-horse')
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
  expect(await screen.findByText('Welcome, Demo Student!')).toBeInTheDocument()
})

test('a wrong password shows an error under the password field', async () => {
  render(<LoginPage />)
  await userEvent.type(screen.getByLabelText('Email'), 'demo@edupay.test')
  await userEvent.type(screen.getByLabelText('Password'), 'wrong-horse')
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent('Wrong email or password.')
  const password = screen.getByLabelText('Password')
  expect(password).toHaveAttribute('aria-invalid', 'true')
  expect(password).toHaveAccessibleDescription('Wrong email or password.')
  expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid')
  expect(screen.queryByText(/Welcome/)).not.toBeInTheDocument()
})

test('the error clears when a retry succeeds', async () => {
  render(<LoginPage />)
  await userEvent.type(screen.getByLabelText('Email'), 'demo@edupay.test')
  await userEvent.type(screen.getByLabelText('Password'), 'wrong-horse')
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
  await screen.findByRole('alert')
  await userEvent.clear(screen.getByLabelText('Password'))
  await userEvent.type(screen.getByLabelText('Password'), 'correct-horse')
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
  expect(await screen.findByText('Welcome, Demo Student!')).toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
