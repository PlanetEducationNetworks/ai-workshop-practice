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
  await userEvent.type(screen.getByLabelText('Password'), 'wrong-password')
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Wrong email or password.')
  expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true')
  expect(screen.queryByText(/Welcome/)).not.toBeInTheDocument()
})

test('a previous login error is cleared when the form is submitted again', async () => {
  render(<LoginPage />)
  await userEvent.type(screen.getByLabelText('Email'), 'demo@edupay.test')
  await userEvent.type(screen.getByLabelText('Password'), 'wrong-password')
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
  expect(await screen.findByRole('alert')).toBeInTheDocument()

  await userEvent.clear(screen.getByLabelText('Password'))
  await userEvent.type(screen.getByLabelText('Password'), 'correct-horse')
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(await screen.findByText('Welcome, Demo Student!')).toBeInTheDocument()
})
