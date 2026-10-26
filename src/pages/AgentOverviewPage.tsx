import { useState } from 'react'
import { AGENTS } from '../data/agents'
import { Button, Select } from '../components/ui'

// Admin > Finance > Agent Overview. Open /#agents.
// ponytail: sizes and default from the Figma handoff note, Radu to confirm
const SIZES = [10, 25, 50, 100]

export function AgentOverviewPage() {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(SIZES[0])
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
            setSize(s)
            setPage(1)
          }}
        />
        <span aria-live="polite">{`${start + 1}–${end} of ${total}`}</span>
        <Button type="button" aria-disabled={page === 1} onClick={() => page > 1 && setPage(page - 1)}>
          Previous
        </Button>
        {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
          <Button key={n} type="button" aria-current={n === page ? 'page' : undefined} onClick={() => setPage(n)}>
            {n}
          </Button>
        ))}
        <Button type="button" aria-disabled={page === pages} onClick={() => page < pages && setPage(page + 1)}>
          Next
        </Button>
      </nav>
    </div>
  )
}
