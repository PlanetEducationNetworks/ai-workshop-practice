import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

test('shows no error and is valid by default', () => {
  render(<Input label="Name" value="" onChange={() => {}} />)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(screen.getByLabelText('Name')).toBeValid()
})

test('shows the error message and marks the field invalid', () => {
  render(<Input label="Name" value="" onChange={() => {}} error="Required" />)
  expect(screen.getByRole('alert')).toHaveTextContent('Required')
  expect(screen.getByLabelText('Name')).toBeInvalid()
  expect(screen.getByLabelText('Name')).toHaveAccessibleDescription('Required')
})

test('calls onChange with the typed value', async () => {
  const onChange = vi.fn()
  render(<Input label="Name" value="" onChange={onChange} />)
  await userEvent.type(screen.getByLabelText('Name'), 'a')
  expect(onChange).toHaveBeenCalledWith('a')
})
