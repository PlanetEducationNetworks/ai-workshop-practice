import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AgentOverviewPage } from './AgentOverviewPage'

const rows = () => screen.getAllByRole('row').length - 1 // minus header

test('page 1 shows 10 of 57 agencies, Previous is disabled', () => {
  render(<AgentOverviewPage />)
  expect(rows()).toBe(10)
  expect(screen.getByText('1–10 of 57')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Previous' })).toHaveAttribute('aria-disabled', 'true')
})

test('Next and Previous move between pages', async () => {
  render(<AgentOverviewPage />)
  await userEvent.click(screen.getByRole('button', { name: 'Next' }))
  expect(screen.getByText('11–20 of 57')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page')
  await userEvent.click(screen.getByRole('button', { name: 'Previous' }))
  expect(screen.getByText('1–10 of 57')).toBeInTheDocument()
})

test('last page shows the remainder and disables Next', async () => {
  render(<AgentOverviewPage />)
  await userEvent.click(screen.getByRole('button', { name: '6' }))
  expect(rows()).toBe(7)
  expect(screen.getByText('51–57 of 57')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Next' })).toHaveAttribute('aria-disabled', 'true')
})

test('changing rows per page goes back to page 1', async () => {
  render(<AgentOverviewPage />)
  await userEvent.click(screen.getByRole('button', { name: 'Next' }))
  await userEvent.click(screen.getByRole('button', { name: /Rows per page/ }))
  await userEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: '25' }))
  expect(rows()).toBe(25)
  expect(screen.getByText('1–25 of 57')).toBeInTheDocument()
})
