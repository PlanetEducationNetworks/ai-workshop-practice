import { FEES } from '../data/fees'
import { STUDENT, type Student } from '../data/student'
import { formatPence, toPence } from '../lib/money'

export function FeesPage({ student = STUDENT }: { student?: Student }) {
  const subtotal = FEES.reduce((sum, f) => sum + toPence(f.price), 0)
  const tuition = FEES.filter(f => f.name.startsWith('Tuition')).reduce((s, f) => s + toPence(f.price), 0)
  const discount = student.hasSibling ? Math.round(tuition / 10) : 0
  const total = subtotal - discount
  const base = Math.floor(total / 3), extra = total - base * 3
  const parts = [0, 1, 2].map(i => base + (i < extra ? 1 : 0))
  return (
    <div className="login">
      <h1>Fees for {student.name}</h1>
      <table className="fees"><tbody>
        {FEES.map(f => <tr key={f.name}><td>{f.name}</td><td>{formatPence(toPence(f.price))}</td></tr>)}
        {discount > 0 && <tr><td>Sibling discount</td><td>−{formatPence(discount)}</td></tr>}
      </tbody><tfoot><tr><th>Total</th><th data-testid="total">{formatPence(total)}</th></tr></tfoot></table>
      <h2>Pay in 3</h2>
      <ul>{parts.map((p, i) => <li key={i} data-testid="instalment">{formatPence(p)}</li>)}</ul>
    </div>
  )
}
