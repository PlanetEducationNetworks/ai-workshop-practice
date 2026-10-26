import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AgentOverviewPage } from './AgentOverviewPage'

beforeEach(() => history.replaceState(null, '', '/'))

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

const at = (search: string) => history.replaceState(null, '', `/${search}#agents`)

test('page and size are read from the URL', () => {
  at('?page=3&size=10')
  render(<AgentOverviewPage />)
  expect(screen.getByText('21–30 of 57')).toBeInTheDocument()
})

test('size is read from the URL', () => {
  at('?size=25')
  render(<AgentOverviewPage />)
  expect(rows()).toBe(25)
})

test('a page past the end shows the last page', () => {
  at('?page=999&size=10')
  render(<AgentOverviewPage />)
  expect(screen.getByText('51–57 of 57')).toBeInTheDocument()
})

test.each(['?page=abc&size=7', '?page=-1', '?page=0', '?page=2.5', '?page='])(
  'bad URL %s falls back to page 1 with 10 rows',
  search => {
    at(search)
    render(<AgentOverviewPage />)
    expect(screen.getByText('1–10 of 57')).toBeInTheDocument()
    expect(rows()).toBe(10)
  }
)

test('Next writes page and size to the URL and keeps the hash', async () => {
  at('')
  render(<AgentOverviewPage />)
  await userEvent.click(screen.getByRole('button', { name: 'Next' }))
  expect(location.search).toBe('?page=2&size=10')
  expect(location.hash).toBe('#agents')
})

test('changing rows per page writes size and page 1 to the URL', async () => {
  render(<AgentOverviewPage />)
  await userEvent.click(screen.getByRole('button', { name: /Rows per page/ }))
  await userEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: '25' }))
  expect(location.search).toBe('?page=1&size=25')
})

const back = () =>
  act(async () => {
    history.back()
    await new Promise(r => setTimeout(r, 50))
  })

test('Back restores the previous page', async () => {
  render(<AgentOverviewPage />)
  await userEvent.click(screen.getByRole('button', { name: 'Next' }))
  await back()
  expect(screen.getByText('1–10 of 57')).toBeInTheDocument()
})

test('Back after changing rows per page restores size and page', async () => {
  render(<AgentOverviewPage />)
  await userEvent.click(screen.getByRole('button', { name: 'Next' }))
  await userEvent.click(screen.getByRole('button', { name: /Rows per page/ }))
  await userEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: '25' }))
  await back()
  expect(screen.getByText('11–20 of 57')).toBeInTheDocument()
  expect(rows()).toBe(10)
})
