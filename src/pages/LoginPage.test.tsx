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

test('a wrong password shows an error on the password field', async () => {
  render(<LoginPage />)
  await userEvent.type(screen.getByLabelText('Email'), 'demo@edupay.test')
  await userEvent.type(screen.getByLabelText('Password'), 'wrong-horse')
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

  const message = await screen.findByText('Wrong email or password.')
  expect(message).toBeInTheDocument()

  // the message belongs to the password field, not the form at large
  const passwordField = screen.getByLabelText('Password')
  expect(passwordField).toHaveAttribute('aria-invalid', 'true')
  expect(passwordField).toHaveAttribute('aria-describedby', message.id)
})
