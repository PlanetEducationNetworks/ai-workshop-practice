import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AgentOverviewPage } from './AgentOverviewPage'

const next = () => userEvent.click(screen.getByRole('button', { name: 'Next' }))
const dataRows = () => screen.getAllByRole('row').length - 1
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
