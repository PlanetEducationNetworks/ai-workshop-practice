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

test('wrong password shows an error', async () => {
  render(<LoginPage />)
  await userEvent.type(screen.getByLabelText('Email'), 'demo@edupay.test')
  await userEvent.type(screen.getByLabelText('Password'), 'x')
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
  expect(await screen.findByRole('alert')).toBeInTheDocument()
})
