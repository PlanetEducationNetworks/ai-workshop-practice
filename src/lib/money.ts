/** Turns a price from the fees data ("450.00") into pence (45000). */
export function toPence(price: string): number {
  return Math.round(parseFloat(price) * 100)
}

/** 1250 → "£12.50" */
export function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`
}
