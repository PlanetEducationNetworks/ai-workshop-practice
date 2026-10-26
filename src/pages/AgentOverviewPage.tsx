import { useEffect, useState } from 'react'
import { AGENTS } from '../data/agents'
import { Button, Select } from '../components/ui'

const SIZES = [10, 25, 50]

// Page and size live in the query string (before the #agents hash). Bad values fall back instead of breaking.
function readUrl() {
  const params = new URLSearchParams(location.search)
  const sizeParam = Number(params.get('size'))
  const size = SIZES.includes(sizeParam) ? sizeParam : SIZES[0]
  const pageParam = Number(params.get('page'))
  const lastPage = Math.ceil(AGENTS.length / size)
  const page = Number.isInteger(pageParam) && pageParam >= 1 ? Math.min(pageParam, lastPage) : 1
  return { page, size }
}

// Admin > Finance > Agent Overview. Open /#agents.
export function AgentOverviewPage() {
  const [{ page, size }, setView] = useState(readUrl)
  const pages = Math.ceil(AGENTS.length / size)
  const start = (page - 1) * size
  const rows = AGENTS.slice(start, start + size)

  useEffect(() => {
    const onPopState = () => setView(readUrl())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  function go(nextPage: number, nextSize: number) {
    const params = new URLSearchParams(location.search)
    params.set('page', String(nextPage))
    params.set('size', String(nextSize))
    history.pushState(null, '', `?${params}${location.hash}`)
    setView({ page: nextPage, size: nextSize })
  }

  return (
    <div className="login">
      <h1>Agent Overview</h1>
      <Select label="Rows per page" value={size} options={SIZES} onChange={next => go(1, next)} />
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
        <Button type="button" disabled={page === 1} onClick={() => go(page - 1, size)}>Previous</Button>
        <Button type="button" disabled={page === pages} onClick={() => go(page + 1, size)}>Next</Button>
      </div>
    </div>
  )
}
