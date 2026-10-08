import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupPage } from './SignupPage'

test('a short password shows "Weak"', async () => {
  render(<SignupPage />)
  await userEvent.type(screen.getByLabelText('Password'), 'abc')
  expect(await screen.findByText('Weak')).toBeInTheDocument()
})

test('a long mixed password shows "Strong"', async () => {
  render(<SignupPage />)
  await userEvent.type(screen.getByLabelText('Password'), 'Correct-Horse-Battery-9')
  expect(await screen.findByText('Strong')).toBeInTheDocument()
})
