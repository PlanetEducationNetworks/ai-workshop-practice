import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AGENTS } from '../data/agents'
import { AgentOverviewPage } from './AgentOverviewPage'

const next = () => userEvent.click(screen.getByRole('button', { name: 'Next' }))
const dataRows = () => screen.getAllByRole('row').length - 1
const search = (text: string) => userEvent.type(screen.getByLabelText('Search'), text)
const cells = (col: number) =>
  screen.getAllByRole('row').slice(1).map(r => within(r).getAllByRole('cell')[col].textContent)
const students = () => cells(2).map(Number)
const sortButton = () => screen.getByRole('button', { name: 'Students' })
const studentsHeader = () => screen.getByRole('columnheader', { name: 'Students' })
const nameOf = (id: number) => AGENTS.find(a => a.id === id)!.name
const COUNTRIES = [...new Set(AGENTS.map(a => a.country))].sort()
const open = (search = '') => {
  history.replaceState(null, '', `/${search}#agents`)
  return render(<AgentOverviewPage />)
}
const filterButton = (kind: 'country' | 'students') => screen.getByRole('button', { name: new RegExp(`^Filter by ${kind}`) })
const chooseFilter = async (kind: 'country' | 'students', option: string) => {
  await userEvent.click(filterButton(kind))
  await userEvent.click(screen.getByRole('menuitemradio', { name: option }))
}
const emptyState = () => screen.getByRole('heading', { level: 2 }).closest<HTMLElement>('.empty')!

beforeEach(() => history.replaceState(null, '', '/#agents'))

test('starts on page 1 with 10 rows and Previous disabled', () => {
  render(<AgentOverviewPage />)
  expect(dataRows()).toBe(10)
  expect(screen.getByText('Showing 1–10 of 57 agents')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled()
})

test('Next and Previous move between pages', async () => {
  render(<AgentOverviewPage />)
  await next()
  expect(screen.getByText('Showing 11–20 of 57 agents')).toBeInTheDocument()
  expect(screen.getByText('Mumbai Study Desk')).toBeInTheDocument()
  expect(screen.queryByText('Dhaka Study Link')).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Previous' }))
  expect(screen.getByText('Showing 1–10 of 57 agents')).toBeInTheDocument()
})

test('Next is disabled on the last page, which has 7 agents', async () => {
  render(<AgentOverviewPage />)
  for (let i = 0; i < 5; i++) await next()
  expect(screen.getByText('Showing 51–57 of 57 agents')).toBeInTheDocument()
  expect(dataRows()).toBe(7)
  expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
})

test('Rows per page offers 10, 25 and 50, default 10', () => {
  render(<AgentOverviewPage />)
  const select = screen.getByLabelText('Rows per page')
  expect(select).toHaveValue('10')
  expect(screen.getAllByRole('option').map(o => o.textContent)).toEqual(['10', '25', '50'])
})

test('changing rows per page changes the rows and goes back to page 1', async () => {
  render(<AgentOverviewPage />)
  await next()
  await next()
  expect(screen.getByText('Showing 21–30 of 57 agents')).toBeInTheDocument()
  await userEvent.selectOptions(screen.getByLabelText('Rows per page'), '25')
  expect(screen.getByText('Showing 1–25 of 57 agents')).toBeInTheDocument()
  expect(dataRows()).toBe(25)
  await userEvent.selectOptions(screen.getByLabelText('Rows per page'), '50')
  expect(screen.getByText('Showing 1–50 of 57 agents')).toBeInTheDocument()
})

test('reads page and size from the URL', () => {
  open('?page=3&size=25')
  expect(screen.getByText('Showing 51–57 of 57 agents')).toBeInTheDocument()
  expect(screen.getByLabelText('Rows per page')).toHaveValue('25')
})

test('Next and a size change update the URL and keep the #agents hash', async () => {
  open()
  await next()
  expect(location.search).toBe('?page=2&size=10')
  expect(location.hash).toBe('#agents')
  await userEvent.selectOptions(screen.getByLabelText('Rows per page'), '25')
  expect(location.search).toBe('?page=1&size=25')
  expect(location.hash).toBe('#agents')
})

test('the Back button returns to the previous page', async () => {
  open()
  await next()
  expect(screen.getByText('Showing 11–20 of 57 agents')).toBeInTheDocument()
  history.back()
  expect(await screen.findByText('Showing 1–10 of 57 agents')).toBeInTheDocument()
})

test('a refresh keeps your place', async () => {
  const { unmount } = open()
  await next()
  unmount()
  render(<AgentOverviewPage />)
  expect(screen.getByText('Showing 11–20 of 57 agents')).toBeInTheDocument()
})

test.each([
  '?page=abc', '?page=0', '?page=-2', '?page=2.5', '?page=', '?size=7', '?size=abc', '?size=', '?page=abc&size=999', '?junk',
  '?page=1e1', '?page=0x2', '?page=Infinity', '?size=0x19', '?size=25.0', '?size=%2025',
  '?country=Narnia', '?students=lots', '?country=&students=',
])('a bad URL (%s) falls back to page 1 with 10 rows', search => {
  open(search)
  expect(screen.getByText('Showing 1–10 of 57 agents')).toBeInTheDocument()
  expect(dataRows()).toBe(10)
})

test('a page past the end shows the last page', () => {
  open('?page=99')
  expect(screen.getByText('Showing 51–57 of 57 agents')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
})

// Design: the table has Agency, Country and Students, and a count next to the search
test('the table has Agency, Country and Students columns', () => {
  render(<AgentOverviewPage />)
  expect(screen.getAllByRole('columnheader').map(h => h.textContent?.trim())).toEqual(['Agency', 'Country', 'Students'])
  const first = screen.getAllByRole('row')[1]
  expect(within(first).getAllByRole('cell').map(c => c.textContent)).toEqual(['Dhaka Study Link', 'Bangladesh', '3'])
})

test('every agency has a country', () => {
  expect(AGENTS.every(a => a.country.length > 0)).toBe(true)
})

test('a count next to the search follows the results', async () => {
  render(<AgentOverviewPage />)
  expect(screen.getByText('57 agencies')).toBeInTheDocument()
  await search('dhaka')
  expect(screen.getByText('3 agencies')).toBeInTheDocument()
  await userEvent.clear(screen.getByLabelText('Search'))
  await search('hanoi abroad 3')
  expect(screen.getByText('1 agency')).toBeInTheDocument()
  await userEvent.clear(screen.getByLabelText('Search'))
  await search('zzz')
  expect(screen.getByText('0 agencies')).toBeInTheDocument()
})

// Search and sort
test('search filters by agency name, ignoring case and spaces, and Showing counts the matches', async () => {
  render(<AgentOverviewPage />)
  await search('  DHAKA ')
  expect(cells(0)).toEqual(['Dhaka Study Link', 'Dhaka Study Link 2', 'Dhaka Study Link 3'])
  expect(screen.getByText('Showing 1–3 of 3 agents')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
})

test('searching goes back to page 1', async () => {
  open('?page=3&size=10')
  await search('dhaka')
  expect(screen.getByText('Showing 1–3 of 3 agents')).toBeInTheDocument()
})

test('clearing the search brings every agent back', async () => {
  render(<AgentOverviewPage />)
  await search('dhaka')
  await userEvent.clear(screen.getByLabelText('Search'))
  expect(screen.getByText('Showing 1–10 of 57 agents')).toBeInTheDocument()
})

test('searching does not break on regex characters', async () => {
  render(<AgentOverviewPage />)
  await search('(.*[[') // user-event types "[[" as one literal "["
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('No agencies match “(.*[”')
})

test('sorting by students: ascending, then descending, ties keep their original order', async () => {
  render(<AgentOverviewPage />)
  await userEvent.click(sortButton())
  expect(studentsHeader()).toHaveAttribute('aria-sort', 'ascending')
  expect(students()).toEqual([...students()].sort((a, b) => a - b))
  expect(students()[0]).toBe(3)
  expect(cells(0).slice(0, 2)).toEqual([nameOf(1), nameOf(41)])
  await userEvent.click(sortButton())
  expect(studentsHeader()).toHaveAttribute('aria-sort', 'descending')
  expect(students()).toEqual([...students()].sort((a, b) => b - a))
  expect(students()[0]).toBe(42)
})

test('sorting applies to every page, not just the visible one', async () => {
  render(<AgentOverviewPage />)
  await userEvent.click(sortButton())
  const firstPageLast = students().at(-1)!
  await next()
  expect(students()[0]).toBeGreaterThanOrEqual(firstPageLast)
})

test('search and sort work together', async () => {
  render(<AgentOverviewPage />)
  await search('dhaka')
  await userEvent.click(sortButton())
  await userEvent.click(sortButton())
  expect(students()).toEqual([...students()].sort((a, b) => b - a))
  expect(screen.getByText('Showing 1–3 of 3 agents')).toBeInTheDocument()
})

test('search and sort are kept in the URL', async () => {
  open()
  await search('dhaka')
  expect(location.search).toBe('?page=1&size=10&q=dhaka')
  await userEvent.click(sortButton())
  expect(location.search).toBe('?page=1&size=10&q=dhaka&sort=asc')
})

test('starting a search adds one history entry, more typing replaces it, and Back returns to where you were', async () => {
  open('?page=3')
  const before = history.length
  await search('dhaka')
  expect(history.length).toBe(before + 1)
  history.back()
  expect(await screen.findByText('Showing 21–30 of 57 agents')).toBeInTheDocument()
  expect(screen.getByLabelText('Search')).toHaveValue('')
})

test('a refresh keeps the search and the sort', async () => {
  const { unmount } = open()
  await search('dhaka')
  await userEvent.click(sortButton())
  unmount()
  render(<AgentOverviewPage />)
  expect(screen.getByLabelText('Search')).toHaveValue('dhaka')
  expect(studentsHeader()).toHaveAttribute('aria-sort', 'ascending')
})

test('other URL params are kept when the page changes', async () => {
  open('?utm_source=teams')
  await next()
  expect(new URLSearchParams(location.search).get('utm_source')).toBe('teams')
  expect(new URLSearchParams(location.search).get('page')).toBe('2')
})

test('sorting does not reorder the shared agent list', async () => {
  const ids = AGENTS.map(a => a.id)
  render(<AgentOverviewPage />)
  await userEvent.click(sortButton())
  await userEvent.click(sortButton())
  expect(AGENTS.map(a => a.id)).toEqual(ids)
})

test('reads search and sort from the URL, and ignores a bad sort value', () => {
  open('?q=dhaka&sort=desc')
  expect(screen.getByLabelText('Search')).toHaveValue('dhaka')
  expect(screen.getByText('Showing 1–3 of 3 agents')).toBeInTheDocument()
  expect(studentsHeader()).toHaveAttribute('aria-sort', 'descending')
})

test('a bad sort value in the URL means no sorting', () => {
  open('?sort=sideways')
  expect(studentsHeader()).toHaveAttribute('aria-sort', 'none')
  expect(cells(0)[0]).toBe(nameOf(1))
})

test('a page past the end of the search results shows the last page of the results', () => {
  open('?page=9&q=dhaka')
  expect(screen.getByText('Showing 1–3 of 3 agents')).toBeInTheDocument()
})

// Filters from the design: Country and Students
test('the Country menu lists All countries, then every country A to Z', async () => {
  render(<AgentOverviewPage />)
  await userEvent.click(filterButton('country'))
  expect(screen.getByRole('menu', { name: 'Filter by country' })).toBeInTheDocument()
  expect(screen.getAllByRole('menuitemradio').map(i => i.textContent)).toEqual(['All countries', ...COUNTRIES])
  expect(screen.getByRole('menuitemradio', { name: 'All countries' })).toBeChecked()
})

test('the Students menu offers the five ranges from the design', async () => {
  render(<AgentOverviewPage />)
  await userEvent.click(filterButton('students'))
  expect(screen.getAllByRole('menuitemradio').map(i => i.textContent)).toEqual([
    'Any number', 'None', '1–10', '11–25', '26 or more',
  ])
})

test('choosing a country filters the table, the count and Showing, and the button shows the choice', async () => {
  render(<AgentOverviewPage />)
  const bangladesh = AGENTS.filter(a => a.country === 'Bangladesh')
  await chooseFilter('country', 'Bangladesh')
  expect(cells(1).every(c => c === 'Bangladesh')).toBe(true)
  expect(screen.getByText(`Showing 1–10 of ${bangladesh.length} agents`)).toBeInTheDocument()
  expect(screen.getByText(`${bangladesh.length} agencies`)).toBeInTheDocument()
  expect(filterButton('country')).toHaveTextContent('Country: Bangladesh')
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
})

test.each([
  ['1–10', (n: number) => n >= 1 && n <= 10],
  ['11–25', (n: number) => n >= 11 && n <= 25],
  ['26 or more', (n: number) => n >= 26],
])('the Students range %s keeps only agencies in that range', async (label, inRange) => {
  render(<AgentOverviewPage />)
  const expected = AGENTS.filter(a => inRange(a.students)).length
  await chooseFilter('students', label)
  expect(screen.getByText(`${expected} agencies`)).toBeInTheDocument()
  expect(students().every(inRange)).toBe(true)
  expect(filterButton('students')).toHaveTextContent(`Students: ${label}`)
})

test('both filters work together with search and sorting', async () => {
  render(<AgentOverviewPage />)
  await chooseFilter('country', 'Bangladesh')
  await chooseFilter('students', '11–25')
  const expected = AGENTS.filter(a => a.country === 'Bangladesh' && a.students >= 11 && a.students <= 25)
  expect(screen.getByText(`Showing 1–${expected.length} of ${expected.length} agents`)).toBeInTheDocument()
  await search('chittagong')
  expect(cells(0)).toEqual(['Chittagong Global', 'Chittagong Global 3'])
  await userEvent.click(sortButton())
  await userEvent.click(sortButton())
  expect(students()).toEqual([17, 17])
})

test('a filter goes back to page 1', async () => {
  open('?page=3')
  await chooseFilter('country', 'Bangladesh')
  expect(screen.getByText(/^Showing 1–/)).toBeInTheDocument()
})

test('Clear filters appears only while a filter is on, and clears both', async () => {
  render(<AgentOverviewPage />)
  expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument()
  await chooseFilter('country', 'India')
  await chooseFilter('students', '26 or more')
  await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
  expect(screen.getByText('Showing 1–10 of 57 agents')).toBeInTheDocument()
  expect(filterButton('country')).toHaveTextContent(/^Country$/)
  expect(filterButton('students')).toHaveTextContent(/^Students$/)
  expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument()
})

test('filters are kept in the URL and read back from it', async () => {
  open()
  await chooseFilter('country', 'Bangladesh')
  await chooseFilter('students', '11–25')
  const params = new URLSearchParams(location.search)
  expect(params.get('country')).toBe('Bangladesh')
  expect(params.get('students')).toBe('11-25')
  expect(location.hash).toBe('#agents')
  cleanup()
  open('?country=Bangladesh&students=11-25')
  expect(filterButton('country')).toHaveTextContent('Country: Bangladesh')
  expect(filterButton('students')).toHaveTextContent('Students: 11–25')
  expect(cells(1).every(c => c === 'Bangladesh')).toBe(true)
})

test('the filter menus work with the keyboard: open, arrows, Enter, Escape', async () => {
  render(<AgentOverviewPage />)
  filterButton('students').focus()
  await userEvent.keyboard('{Enter}')
  expect(screen.getByRole('menuitemradio', { name: 'Any number' })).toHaveFocus()
  await userEvent.keyboard('{ArrowDown}{ArrowDown}')
  expect(screen.getByRole('menuitemradio', { name: '1–10' })).toHaveFocus()
  await userEvent.keyboard('{End}')
  expect(screen.getByRole('menuitemradio', { name: '26 or more' })).toHaveFocus()
  await userEvent.keyboard('{Escape}')
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  expect(filterButton('students')).toHaveFocus()
  await userEvent.keyboard('{Enter}{ArrowDown}{ArrowDown}{ArrowDown}{Enter}')
  expect(filterButton('students')).toHaveTextContent('Students: 11–25')
  expect(filterButton('students')).toHaveFocus()
})

test('a filter menu closes when you click elsewhere', async () => {
  render(<AgentOverviewPage />)
  await userEvent.click(filterButton('country'))
  expect(screen.getByRole('menu')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('heading', { level: 1 }))
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
})

test('the filter buttons say whether their menu is open', async () => {
  render(<AgentOverviewPage />)
  expect(filterButton('country')).toHaveAttribute('aria-expanded', 'false')
  await userEvent.click(filterButton('country'))
  expect(filterButton('country')).toHaveAttribute('aria-expanded', 'true')
})

// Empty states from the design
test('no matches follows the design: header stays, count is 0, pager is hidden, hint and Clear search', async () => {
  render(<AgentOverviewPage />)
  await search('Lagoss')
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('No agencies match “Lagoss”')
  expect(screen.getByText('Check the spelling, or try part of the agency name.')).toBeInTheDocument()
  expect(screen.getByText('0 agencies')).toBeInTheDocument()
  expect(screen.getAllByRole('columnheader')).toHaveLength(3)
  expect(dataRows()).toBe(0)
  expect(screen.getByLabelText('Rows per page')).not.toBeVisible()
  expect(screen.queryByText(/Showing/)).not.toBeInTheDocument()
  expect(within(emptyState()).getByRole('button', { name: 'Clear search' })).toBeInTheDocument()
})

test('filters with no match say so, and offer Clear filters', async () => {
  render(<AgentOverviewPage />)
  await chooseFilter('students', 'None')
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('No agencies match these filters')
  expect(screen.getByText('Try a different country or student range.')).toBeInTheDocument()
  await userEvent.click(within(emptyState()).getByRole('button', { name: 'Clear filters' }))
  expect(screen.getByText('Showing 1–10 of 57 agents')).toBeInTheDocument()
})

test('a search plus filters with no match offers Clear search and filters', async () => {
  render(<AgentOverviewPage />)
  await chooseFilter('country', 'Egypt')
  await search('dhaka')
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('No agencies match “dhaka”')
  await userEvent.click(within(emptyState()).getByRole('button', { name: 'Clear search and filters' }))
  expect(screen.getByLabelText('Search')).toHaveValue('')
  expect(screen.getByText('Showing 1–10 of 57 agents')).toBeInTheDocument()
})

test('the empty state button brings everything back and puts focus in the Search box', async () => {
  render(<AgentOverviewPage />)
  await search('zzz')
  within(emptyState()).getByRole('button', { name: 'Clear search' }).focus()
  await userEvent.keyboard('{Enter}')
  expect(screen.getByLabelText('Search')).toHaveValue('')
  expect(screen.getByText('Showing 1–10 of 57 agents')).toBeInTheDocument()
  expect(screen.getByLabelText('Search')).toHaveFocus()
})

test('a clear (×) button inside the search box appears only when there is text, and keeps focus in the box', async () => {
  render(<AgentOverviewPage />)
  expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
  await search('dhaka')
  await userEvent.click(screen.getByRole('button', { name: 'Clear search' }))
  expect(screen.getByLabelText('Search')).toHaveValue('')
  expect(screen.getByLabelText('Search')).toHaveFocus()
  expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
})

// Pager and the rest of the design
test('the pager is a navigation landmark with numbered pages, and the current page is marked', async () => {
  render(<AgentOverviewPage />)
  const nav = screen.getByRole('navigation', { name: 'Pagination' })
  expect(within(nav).getByRole('button', { name: 'Previous' })).toBeInTheDocument()
  expect(within(nav).getByRole('button', { name: 'Next' })).toBeInTheDocument()
  expect(within(nav).getAllByRole('button', { name: /^Page \d$/ })).toHaveLength(6)
  expect(within(nav).getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page')
  await next()
  expect(within(nav).getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page')
  expect(within(nav).getByRole('button', { name: 'Page 1' })).not.toHaveAttribute('aria-current')
  expect(nav.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
})

test('Previous and Next use the design chevron icons, not text arrows', () => {
  render(<AgentOverviewPage />)
  const previous = screen.getByRole('button', { name: 'Previous' })
  const nextButton = screen.getByRole('button', { name: 'Next' })
  expect(previous.querySelector('.icon-left')).toHaveAttribute('aria-hidden', 'true')
  expect(nextButton.querySelector('.icon-right')).toHaveAttribute('aria-hidden', 'true')
  expect(previous).not.toHaveTextContent('‹')
  expect(nextButton).not.toHaveTextContent('›')
})

test('a page number goes straight to that page and shows it in the URL', async () => {
  open()
  await userEvent.click(screen.getByRole('button', { name: 'Page 4' }))
  expect(screen.getByText('Showing 31–40 of 57 agents')).toBeInTheDocument()
  expect(location.search).toBe('?page=4&size=10')
})

test('the page has a breadcrumb, a subtitle and a single navigation landmark', () => {
  render(<AgentOverviewPage />)
  expect(screen.getByText('Admin / Finance')).toBeInTheDocument()
  expect(screen.getByText('Every agency and the number of students linked to it.')).toBeInTheDocument()
  expect(screen.getAllByRole('navigation')).toHaveLength(1)
})

test('the search box shows a placeholder and keeps its Search label', () => {
  render(<AgentOverviewPage />)
  expect(screen.getByPlaceholderText('Search agencies')).toBe(screen.getByLabelText('Search'))
})

test('the Showing line is a polite status', () => {
  render(<AgentOverviewPage />)
  expect(screen.getByRole('status')).toHaveTextContent('Showing 1–10 of 57 agents')
  expect(screen.getByText('Showing 1–10 of 57 agents')).toHaveAttribute('aria-live', 'polite')
})

test('with no results the empty state is the one status, so it is announced and nothing is duplicated', async () => {
  render(<AgentOverviewPage />)
  await search('zzz')
  expect(screen.getByRole('status')).toHaveTextContent('No agencies match “zzz”')
  expect(screen.getAllByText('No agencies match “zzz”')).toHaveLength(1)
})

test('it works with the keyboard only', async () => {
  render(<AgentOverviewPage />)
  await userEvent.tab()
  expect(screen.getByLabelText('Search')).toHaveFocus()
  await userEvent.tab()
  expect(filterButton('country')).toHaveFocus()
  await userEvent.tab()
  expect(filterButton('students')).toHaveFocus()
  await userEvent.tab()
  expect(sortButton()).toHaveFocus()
  await userEvent.keyboard('{Enter}')
  expect(studentsHeader()).toHaveAttribute('aria-sort', 'ascending')
  await userEvent.keyboard('{Tab}')
  expect(screen.getByLabelText('Rows per page')).toHaveFocus()
})

test('focus moves to Previous when Next becomes disabled on the last page', async () => {
  open('?page=5')
  screen.getByRole('button', { name: 'Next' }).focus()
  await userEvent.keyboard('{Enter}')
  expect(screen.getByText('Showing 51–57 of 57 agents')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Previous' })).toHaveFocus()
})

test('focus moves to Next when Previous becomes disabled on page 1', async () => {
  open('?page=2')
  screen.getByRole('button', { name: 'Previous' }).focus()
  await userEvent.keyboard('{Enter}')
  expect(screen.getByText('Showing 1–10 of 57 agents')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus()
})

test('focus stays in the pager when a two-page list reaches its last page', async () => {
  open('?size=50')
  screen.getByRole('button', { name: 'Next' }).focus()
  await userEvent.keyboard('{Enter}')
  expect(screen.getByText('Showing 51–57 of 57 agents')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Previous' })).toHaveFocus()
})
