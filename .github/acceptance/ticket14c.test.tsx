// Acceptance test for TICKET-14 part 3 (pay in 3). CI copies this into src/ and runs it on every pull request.
import { render, screen } from '@testing-library/react'
import { FeesPage } from '../pages/FeesPage'
import { SIBLING_STUDENT, STUDENT } from '../data/student'

const amounts = () => screen.getAllByTestId('instalment').map(e => e.textContent?.match(/£[\d,.]+/)?.[0])

test('TICKET-14 part 3: three instalments add up to the total exactly', () => {
  render(<FeesPage student={SIBLING_STUDENT} />)
  expect(amounts()).toEqual(['£151.52', '£151.52', '£151.51'])
})

test('TICKET-14 part 3: works without a discount too', () => {
  render(<FeesPage student={STUDENT} />)
  expect(amounts()).toEqual(['£166.52', '£166.52', '£166.51'])
})
