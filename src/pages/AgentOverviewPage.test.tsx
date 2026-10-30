import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AgentOverviewPage, pageItems } from './AgentOverviewPage'
import { AGENTS } from '../data/agents'

beforeEach(() => history.replaceState(null, '', '/'))

const rows = () => screen.getAllByRole('row').length - 1 // minus header

test('page 1 shows 10 of 57 agencies, Previous is disabled', () => {
  render(<AgentOverviewPage />)
  expect(rows()).toBe(10)
  expect(screen.getByText('Showing 1–10 of 57 agents')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
})

test('Next and Previous move between pages', async () => {
  render(<AgentOverviewPage />)
  await userEvent.click(screen.getByRole('button', { name: 'Next' }))
  expect(screen.getByText('Showing 11–20 of 57 agents')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page')
  await userEvent.click(screen.getByRole('button', { name: 'Previous' }))
  expect(screen.getByText('Showing 1–10 of 57 agents')).toBeInTheDocument()
})

test('last page shows the remainder and disables Next', async () => {
  render(<AgentOverviewPage />)
  await userEvent.click(screen.getByRole('button', { name: '6' }))
  expect(rows()).toBe(7)
  expect(screen.getByText('Showing 51–57 of 57 agents')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
})

test('changing rows per page goes back to page 1', async () => {
  render(<AgentOverviewPage />)
  await userEvent.click(screen.getByRole('button', { name: 'Next' }))
  await userEvent.selectOptions(screen.getByLabelText('Rows per page'), '25')
  expect(rows()).toBe(25)
  expect(screen.getByText('Showing 1–25 of 57 agents')).toBeInTheDocument()
})

const at = (search: string) => history.replaceState(null, '', `/${search}#agents`)

test('page and size are read from the URL', () => {
  at('?page=3&size=10')
  render(<AgentOverviewPage />)
  expect(screen.getByText('Showing 21–30 of 57 agents')).toBeInTheDocument()
})

test('size is read from the URL', () => {
  at('?size=25')
  render(<AgentOverviewPage />)
  expect(rows()).toBe(25)
})

test('a page past the end shows the last page', () => {
  at('?page=999&size=10')
  render(<AgentOverviewPage />)
  expect(screen.getByText('Showing 51–57 of 57 agents')).toBeInTheDocument()
})

test.each(['?page=abc&size=7', '?page=-1', '?page=0', '?page=2.5', '?page=', '?size=100', '?page=0x19', '?page=1e1', '?size=0x19'])(
  'bad URL %s falls back to page 1 with 10 rows',
  search => {
    at(search)
    render(<AgentOverviewPage />)
    expect(screen.getByText('Showing 1–10 of 57 agents')).toBeInTheDocument()
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
  await userEvent.selectOptions(screen.getByLabelText('Rows per page'), '25')
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
  expect(screen.getByText('Showing 1–10 of 57 agents')).toBeInTheDocument()
})

test('Back after changing rows per page restores size and page', async () => {
  render(<AgentOverviewPage />)
  await userEvent.click(screen.getByRole('button', { name: 'Next' }))
  await userEvent.selectOptions(screen.getByLabelText('Rows per page'), '25')
  await back()
  expect(screen.getByText('Showing 11–20 of 57 agents')).toBeInTheDocument()
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
  expect(screen.getByText(`Showing 1–${Math.min(10, dhaka.length)} of ${dhaka.length} agents`)).toBeInTheDocument()
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
  expect(screen.getByText('Showing 1–10 of 57 agents')).toBeInTheDocument()
  expect(screen.getByLabelText('Search agencies')).toHaveValue('')
})

test('sorting by students: most first, then fewest first, then back to the original order', async () => {
  render(<AgentOverviewPage />)
  const original = names()
  const header = screen.getByRole('columnheader', { name: /Students/ })
  const sort = screen.getByRole('button', { name: /Students/ })
  const all = AGENTS.map(a => a.students)
  await userEvent.click(sort)
  expect(header).toHaveAttribute('aria-sort', 'descending')
  expect(students()).toEqual([...all].sort((a, b) => b - a).slice(0, 10))
  await userEvent.click(sort)
  expect(header).toHaveAttribute('aria-sort', 'ascending')
  expect(students()).toEqual([...all].sort((a, b) => a - b).slice(0, 10))
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
  const desc = dhaka.map(a => a.students).sort((a, b) => b - a)
  expect(students()).toEqual(desc.slice(0, 10))
})

// --- Level 4: keyboard and screen reader ---
const sizeButton = () => screen.getByRole('button', { name: /Rows per page/ })

test('the pager is a labelled navigation landmark and the current page is announced', () => {
  render(<AgentOverviewPage />)
  expect(screen.getByRole('navigation', { name: 'Agent pagination' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page')
})

test('rows per page opens with the keyboard, arrows move, Enter selects, focus returns to the button', async () => {
  render(<AgentOverviewPage />)
  sizeButton().focus()
  await userEvent.keyboard('{Enter}')
  const list = screen.getByRole('listbox')
  expect(list).toHaveFocus()
  await userEvent.keyboard('{ArrowDown}{Enter}')
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  expect(sizeButton()).toHaveFocus()
  expect(rows()).toBe(25)
})

test('the highlighted option is exposed to screen readers', async () => {
  render(<AgentOverviewPage />)
  await userEvent.click(sizeButton())
  const list = screen.getByRole('listbox')
  expect(list).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: '10' }).id)
  await userEvent.keyboard('{ArrowDown}')
  expect(list).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: '25' }).id)
})

test('Escape closes the rows menu, keeps the size and returns focus to the button', async () => {
  render(<AgentOverviewPage />)
  await userEvent.click(sizeButton())
  await userEvent.keyboard('{ArrowDown}{Escape}')
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  expect(sizeButton()).toHaveFocus()
  expect(rows()).toBe(10)
})

test('when Next becomes disabled, focus moves to the current page button', async () => {
  render(<AgentOverviewPage />)
  await userEvent.click(screen.getByRole('button', { name: '5' }))
  screen.getByRole('button', { name: 'Next' }).focus()
  await userEvent.keyboard('{Enter}')
  expect(screen.getByRole('button', { name: '6' })).toHaveFocus()
})

test('when Previous becomes disabled, focus moves to the current page button', async () => {
  render(<AgentOverviewPage />)
  await userEvent.click(screen.getByRole('button', { name: '2' }))
  screen.getByRole('button', { name: 'Previous' }).focus()
  await userEvent.keyboard('{Enter}')
  expect(screen.getByRole('button', { name: '1' })).toHaveFocus()
})

test('Clear search moves focus back to the search box', async () => {
  render(<AgentOverviewPage />)
  await search('zzzz')
  await userEvent.click(screen.getByRole('button', { name: 'Clear search' }))
  expect(screen.getByLabelText('Search agencies')).toHaveFocus()
})

test('the range text and the count are live regions', () => {
  render(<AgentOverviewPage />)
  expect(screen.getByText('Showing 1–10 of 57 agents')).toHaveAttribute('aria-live', 'polite')
  expect(screen.getByText('57 agents')).toHaveAttribute('aria-live', 'polite')
})

// --- found by the fresh review ---
test('clicking the rows-per-page button while the menu is open closes it', async () => {
  render(<AgentOverviewPage />)
  await userEvent.click(sizeButton())
  expect(screen.getByRole('listbox')).toBeInTheDocument()
  await userEvent.click(sizeButton())
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
})

test('choosing the size that is already selected does not add a history entry', async () => {
  render(<AgentOverviewPage />)
  const before = history.length
  await userEvent.selectOptions(screen.getByLabelText('Rows per page'), '10')
  expect(history.length).toBe(before)
})

test('rows per page offers 10, 25 and 50, default 10', async () => {
  render(<AgentOverviewPage />)
  await userEvent.click(sizeButton())
  const options = within(screen.getByRole('listbox')).getAllByRole('option')
  expect(options.map(o => o.textContent)).toEqual(['10', '25', '50'])
  expect(options[0]).toHaveAttribute('aria-selected', 'true')
})

test('Previous and Next are enabled on a middle page', async () => {
  render(<AgentOverviewPage />)
  await userEvent.click(screen.getByRole('button', { name: 'Next' }))
  expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled()
  expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled()
})

test('the × in the search box clears a search that has results and refocuses the box', async () => {
  render(<AgentOverviewPage />)
  expect(screen.queryByRole('button', { name: 'Clear search text' })).not.toBeInTheDocument()
  await search('dhaka')
  await userEvent.click(screen.getByRole('button', { name: 'Clear search text' }))
  expect(screen.getByLabelText('Search agencies')).toHaveValue('')
  expect(screen.getByLabelText('Search agencies')).toHaveFocus()
  expect(screen.getByText('Showing 1–10 of 57 agents')).toBeInTheDocument()
})

test('page numbers: every number up to 7 pages, then first, last, current ±1 and …', () => {
  expect(pageItems(1, 6)).toEqual([1, 2, 3, 4, 5, 6])
  expect(pageItems(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  expect(pageItems(7, 24)).toEqual([1, '…', 6, 7, 8, '…', 24])
  expect(pageItems(1, 24)).toEqual([1, 2, '…', 24])
  expect(pageItems(24, 24)).toEqual([1, '…', 23, 24])
  expect(pageItems(2, 8)).toEqual([1, 2, 3, '…', 8])
})

test('the search field is a searchbox and the whole Students header cell sorts', async () => {
  render(<AgentOverviewPage />)
  expect(screen.getByRole('searchbox', { name: 'Search agencies' })).toBeInTheDocument()
  await userEvent.click(screen.getByRole('columnheader', { name: /Students/ }))
  expect(screen.getByRole('columnheader', { name: /Students/ })).toHaveAttribute('aria-sort', 'descending')
})
