import { useState } from 'react'
import { AGENTS } from '../data/agents'
import { Button, Select } from '../components/ui'

// Admin > Finance > Agent Overview. Open /#agents.
// ponytail: sizes and default from the Figma handoff note, Radu to confirm
const SIZES = [10, 25, 50, 100]

// Anything that isn't a whole page number or an allowed size falls back to the defaults (Radu to confirm).
function readParams(search: string) {
  const q = new URLSearchParams(search)
  const size = SIZES.includes(Number(q.get('size'))) ? Number(q.get('size')) : SIZES[0]
  const raw = Number(q.get('page'))
  const page = Number.isInteger(raw) && raw >= 1 ? raw : 1
  return { page: Math.min(page, Math.ceil(AGENTS.length / size)), size }
}

export function AgentOverviewPage() {
  const [{ page, size }, setParams] = useState(() => readParams(location.search))
  const total = AGENTS.length
  const pages = Math.ceil(total / size)
  const start = (page - 1) * size
  const end = Math.min(start + size, total)
  return (
    <div className="login">
      <h1>Agent Overview</h1>
      <table className="fees">
        <thead>
          <tr><th>Agency</th><th>Students</th></tr>
        </thead>
        <tbody>
          {AGENTS.slice(start, end).map(a => (
            <tr key={a.id}><td>{a.name}</td><td>{a.students}</td></tr>
          ))}
        </tbody>
      </table>
      <nav className="pager" aria-label="Agent pagination">
        <Select
          label="Rows per page"
          value={size}
          options={SIZES}
          onChange={s => {
            setParams({ page: 1, size: s })
          }}
        />
        <span aria-live="polite">{`${start + 1}–${end} of ${total}`}</span>
        <Button type="button" aria-disabled={page === 1} onClick={() => page > 1 && setParams({ page: page - 1, size })}>
          Previous
        </Button>
        {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
          <Button key={n} type="button" aria-current={n === page ? 'page' : undefined} onClick={() => setParams({ page: n, size })}>
            {n}
          </Button>
        ))}
        <Button type="button" aria-disabled={page === pages} onClick={() => page < pages && setParams({ page: page + 1, size })}>
          Next
        </Button>
      </nav>
    </div>
  )
}
