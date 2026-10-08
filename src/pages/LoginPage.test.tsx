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
  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent('Wrong email or password.')
  expect(screen.getByLabelText('Password')).toHaveAccessibleDescription('Wrong email or password.')
  expect(screen.queryByText(/Welcome/)).not.toBeInTheDocument()
})
