// Acceptance test for TICKET-14. CI copies this into src/ and runs it on every pull request.
import { render, screen } from '@testing-library/react'
import { FeesPage } from '../pages/FeesPage'
import { toPence } from '../lib/money'

test('TICKET-14: the fees page shows the right prices and total', () => {
  render(<FeesPage />)
  expect(screen.getByText('£12.50')).toBeInTheDocument()
  expect(screen.getByText('£30.00')).toBeInTheDocument()
  expect(screen.getByTestId('total')).toHaveTextContent('£499.55')
})

// Fixing only the data file is not enough: finance will keep typing prices like this.
test('TICKET-14: toPence works for every way a price can be written', () => {
  const cases: [string, number][] = [['12.5', 1250], ['30', 3000], ['7.05', 705], ['0.29', 29], ['19.99', 1999], ['450.00', 45000]]
  for (const [price, pence] of cases) expect(toPence(price), price).toBe(pence)
})
