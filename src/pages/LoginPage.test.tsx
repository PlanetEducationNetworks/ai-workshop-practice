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
  const password = screen.getByLabelText('Password')
  await userEvent.type(password, 'wrong-password')
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

  const error = await screen.findByRole('alert')
  expect(error).toHaveTextContent('Wrong email or password.')
  expect(error).toHaveClass('error')
  expect(password.nextElementSibling).toBe(error)
  expect(password).toHaveAttribute('aria-invalid', 'true')
  expect(password).toHaveAccessibleDescription('Wrong email or password.')
  expect(screen.queryByText('Welcome, Demo Student!')).not.toBeInTheDocument()
})

test('a correct password succeeds after a failed login', async () => {
  render(<LoginPage />)
  await userEvent.type(screen.getByLabelText('Email'), 'demo@edupay.test')
  const password = screen.getByLabelText('Password')
  await userEvent.type(password, 'wrong-password')
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
  expect(await screen.findByRole('alert')).toBeInTheDocument()

  await userEvent.clear(password)
  await userEvent.type(password, 'correct-horse')
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(await screen.findByText('Welcome, Demo Student!')).toBeInTheDocument()
})
