import { FEES } from '../data/fees'
import { formatPence, toPence } from '../lib/money'

export function FeesPage() {
  const total = FEES.reduce((sum, f) => sum + toPence(f.price), 0)
  return (
    <div className="login">
      <h1>Your fees</h1>
      <table className="fees">
        <tbody>
          {FEES.map(f => (
            <tr key={f.name}>
              <td>{f.name}</td>
              <td>{formatPence(toPence(f.price))}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th>Total</th>
            <th data-testid="total">{formatPence(total)}</th>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
