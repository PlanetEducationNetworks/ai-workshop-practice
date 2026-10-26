import { useState } from 'react'
import { AGENTS } from '../data/agents'
import { Button, Select } from '../components/ui'

const SIZES = [10, 25, 50]

// Admin > Finance > Agent Overview. Open /#agents.
export function AgentOverviewPage() {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const pages = Math.ceil(AGENTS.length / size)
  const start = (page - 1) * size
  const rows = AGENTS.slice(start, start + size)

  function changeSize(next: number) {
    setSize(next)
    setPage(1)
  }

  return (
    <div className="login">
      <h1>Agent Overview</h1>
      <Select label="Rows per page" value={size} options={SIZES} onChange={changeSize} />
      <table className="fees">
        <thead>
          <tr><th>Agency</th><th>Students</th></tr>
        </thead>
        <tbody>
          {rows.map(a => (
            <tr key={a.id}><td>{a.name}</td><td>{a.students}</td></tr>
          ))}
        </tbody>
      </table>
      <p>Showing {start + 1}–{start + rows.length} of {AGENTS.length} agents</p>
      <div className="pager">
        <Button type="button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
        <Button type="button" disabled={page === pages} onClick={() => setPage(page + 1)}>Next</Button>
      </div>
    </div>
  )
}
