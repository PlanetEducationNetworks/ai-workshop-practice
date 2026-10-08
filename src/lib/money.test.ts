import { formatPence, toPence } from './money'

test('toPence reads a price', () => {
  expect(toPence('450.00')).toBe(45000)
})

test('formatPence shows pounds and pence', () => {
  expect(formatPence(1250)).toBe('£12.50')
})

test('short prices', () => { expect(toPence('12.5')).toBe(1250) })
