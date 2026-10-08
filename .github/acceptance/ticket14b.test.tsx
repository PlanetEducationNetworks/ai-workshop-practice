// Acceptance test for TICKET-14 part 2 (sibling discount). CI copies this into src/ and runs it on every pull request.
import { render, screen } from '@testing-library/react'
import { FeesPage } from '../pages/FeesPage'
import { SIBLING_STUDENT, STUDENT } from '../data/student'

test('TICKET-14 part 2: a sibling gets 10% off tuition only', () => {
  render(<FeesPage student={SIBLING_STUDENT} />)
  expect(screen.getByText(/[-−–]\s?£45\.00/)).toBeInTheDocument()
  expect(screen.getByTestId('total')).toHaveTextContent('£454.55')
})

test('TICKET-14 part 2: no sibling, no discount', () => {
  render(<FeesPage student={STUDENT} />)
  expect(screen.queryByText(/discount/i)).not.toBeInTheDocument()
  expect(screen.getByTestId('total')).toHaveTextContent('£499.55')
})
