import { FEES } from '../data/fees'
import { STUDENT, type Student } from '../data/student'
import { formatPence, toPence } from '../lib/money'

export function FeesPage({ student = STUDENT }: { student?: Student }) {
  const total = FEES.reduce((sum, f) => sum + toPence(f.price), 0)
  // TICKET-14 part 2: sibling discount · part 3: pay in 3
  return (
    <div className="login">
      <h1>Fees for {student.name}</h1>
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
