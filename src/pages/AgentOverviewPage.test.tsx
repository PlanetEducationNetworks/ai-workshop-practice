import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AGENTS } from '../data/agents'
import { AgentOverviewPage } from './AgentOverviewPage'

const next = () => userEvent.click(screen.getByRole('button', { name: 'Next' }))
const dataRows = () => screen.getAllByRole('row').length - 1
const search = (text: string) => userEvent.type(screen.getByLabelText('Search'), text)
const cells = (col: number) =>
  screen.getAllByRole('row').slice(1).map(r => within(r).getAllByRole('cell')[col].textContent)
const students = () => cells(1).map(Number)
const sortButton = () => screen.getByRole('button', { name: 'Students' })
const studentsHeader = () => screen.getByRole('columnheader', { name: 'Students' })
const nameOf = (id: number) => AGENTS.find(a => a.id === id)!.name
const open = (search = '') => {
  history.replaceState(null, '', `/${search}#agents`)
  return render(<AgentOverviewPage />)
}

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

// Level 3: search and sort
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

test('no matches shows an empty message instead of the table', async () => {
  render(<AgentOverviewPage />)
  await search('zzz')
  expect(screen.getByText('No agents found for "zzz".')).toBeInTheDocument()
  expect(screen.queryByRole('table')).not.toBeInTheDocument()
  expect(screen.queryByText(/Showing/)).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
})

test('searching does not break on regex characters', async () => {
  render(<AgentOverviewPage />)
  await search('(.*[[') // user-event types "[[" as one literal "["
  expect(screen.getByText('No agents found for "(.*[".')).toBeInTheDocument()
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

test('search and sort are kept in the URL, and typing does not add history entries', async () => {
  open()
  const before = history.length
  await search('dhaka')
  expect(location.search).toBe('?page=1&size=10&q=dhaka')
  expect(history.length).toBe(before)
  await userEvent.click(sortButton())
  expect(location.search).toBe('?page=1&size=10&q=dhaka&sort=asc')
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

// Level 4: accessibility
test('the pager is a navigation landmark that says which page is current', async () => {
  render(<AgentOverviewPage />)
  const nav = screen.getByRole('navigation', { name: 'Pagination' })
  expect(within(nav).getByRole('button', { name: 'Previous' })).toBeInTheDocument()
  expect(within(nav).getByRole('button', { name: 'Next' })).toBeInTheDocument()
  expect(within(nav).getByText('Page 1 of 6')).toHaveAttribute('aria-current', 'page')
  await next()
  expect(within(nav).getByText('Page 2 of 6')).toHaveAttribute('aria-current', 'page')
})

test('the Showing text is announced politely when it changes', () => {
  render(<AgentOverviewPage />)
  expect(screen.getByText('Showing 1–10 of 57 agents')).toHaveAttribute('aria-live', 'polite')
})

test('it works with the keyboard only', async () => {
  render(<AgentOverviewPage />)
  await userEvent.tab()
  expect(screen.getByLabelText('Search')).toHaveFocus()
  await userEvent.keyboard('dhaka{Tab}')
  expect(screen.getByLabelText('Rows per page')).toHaveFocus()
  await userEvent.keyboard('{Tab}{Enter}')
  expect(studentsHeader()).toHaveAttribute('aria-sort', 'ascending')
})

test('keyboard focus is not lost when Next becomes disabled on the last page', async () => {
  open('?page=5')
  const nextButton = screen.getByRole('button', { name: 'Next' })
  nextButton.focus()
  await userEvent.keyboard('{Enter}')
  expect(screen.getByText('Showing 51–57 of 57 agents')).toBeInTheDocument()
  expect(document.body).not.toHaveFocus()
})
