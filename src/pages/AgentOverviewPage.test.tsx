import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AgentOverviewPage } from './AgentOverviewPage'
import { AGENTS } from '../data/agents'

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

// --- Level 3: search and sort (rules pending Radu: see PR) ---
const names = () => screen.getAllByRole('row').slice(1).map(r => within(r).getAllByRole('cell')[0].textContent)
const students = () => screen.getAllByRole('row').slice(1).map(r => Number(within(r).getAllByRole('cell')[1].textContent))
const search = (text: string) => userEvent.type(screen.getByLabelText('Search agencies'), text)
const dhaka = AGENTS.filter(a => a.name.toLowerCase().includes('dhaka'))

test('search filters ALL agencies, not just the current page, ignoring case', async () => {
  render(<AgentOverviewPage />)
  await search('DHAKA')
  expect(screen.getByText(`${dhaka.length} agents`)).toBeInTheDocument()
  expect(screen.getByText(`1–${Math.min(10, dhaka.length)} of ${dhaka.length}`)).toBeInTheDocument()
  expect(names().every(n => n!.toLowerCase().includes('dhaka'))).toBe(true)
})

test('search ignores spaces around the text', async () => {
  render(<AgentOverviewPage />)
  await search('  dhaka  ')
  expect(screen.getByText(`${dhaka.length} agents`)).toBeInTheDocument()
})

test('searching from a later page goes back to page 1', async () => {
  render(<AgentOverviewPage />)
  await userEvent.click(screen.getByRole('button', { name: '3' }))
  await search('a')
  expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page')
  expect(location.search).toBe('?page=1&size=10')
})

test('no results: empty state, "0 agents", header stays, pager hidden', async () => {
  render(<AgentOverviewPage />)
  await search('zzzz')
  expect(screen.getByText('No agents match “zzzz”')).toBeInTheDocument()
  expect(screen.getByText('0 agents')).toBeInTheDocument()
  expect(screen.getByRole('columnheader', { name: /Agency/ })).toBeInTheDocument()
  expect(screen.queryByRole('navigation', { name: 'Agent pagination' })).not.toBeInTheDocument()
})

test('Clear search brings every agency back', async () => {
  render(<AgentOverviewPage />)
  await search('zzzz')
  await userEvent.click(screen.getByRole('button', { name: 'Clear search' }))
  expect(screen.getByText('1–10 of 57')).toBeInTheDocument()
  expect(screen.getByLabelText('Search agencies')).toHaveValue('')
})

test('sorting by students: ascending, descending, then back to the original order', async () => {
  render(<AgentOverviewPage />)
  const original = names()
  const header = screen.getByRole('columnheader', { name: /Students/ })
  const sort = screen.getByRole('button', { name: /Students/ })
  const all = AGENTS.map(a => a.students)
  await userEvent.click(sort)
  expect(header).toHaveAttribute('aria-sort', 'ascending')
  expect(students()).toEqual([...all].sort((a, b) => a - b).slice(0, 10))
  await userEvent.click(sort)
  expect(header).toHaveAttribute('aria-sort', 'descending')
  expect(students()).toEqual([...all].sort((a, b) => b - a).slice(0, 10))
  await userEvent.click(sort)
  expect(header).not.toHaveAttribute('aria-sort')
  expect(names()).toEqual(original)
})

test('sorting goes back to page 1 and sorts the filtered list', async () => {
  render(<AgentOverviewPage />)
  await userEvent.click(screen.getByRole('button', { name: '3' }))
  await userEvent.click(screen.getByRole('button', { name: /Students/ }))
  expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page')
  await search('dhaka')
  const asc = dhaka.map(a => a.students).sort((a, b) => a - b)
  expect(students()).toEqual(asc.slice(0, 10))
})
