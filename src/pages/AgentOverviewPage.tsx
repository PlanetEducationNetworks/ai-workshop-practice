import { useEffect, useState } from 'react'
import { AGENTS } from '../data/agents'
import { Button, Input, Select } from '../components/ui'

const SIZES = [10, 25, 50]

type Sort = 'asc' | 'desc' | null
type View = { page: number; size: number; q: string; sort: Sort }

// The view lives in the query string (before the #agents hash). Bad values fall back instead of breaking.
function readUrl(): View {
  const params = new URLSearchParams(location.search)
  const sizeParam = Number(params.get('size'))
  const pageParam = Number(params.get('page'))
  const sortParam = params.get('sort')
  return {
    page: Number.isInteger(pageParam) && pageParam >= 1 ? pageParam : 1,
    size: SIZES.includes(sizeParam) ? sizeParam : SIZES[0],
    q: params.get('q') ?? '',
    sort: sortParam === 'asc' || sortParam === 'desc' ? sortParam : null,
  }
}

// Admin > Finance > Agent Overview. Open /#agents.
export function AgentOverviewPage() {
  const [view, setView] = useState(readUrl)
  const { size, q, sort } = view

  const query = q.trim().toLowerCase()
  const matches = AGENTS.filter(a => a.name.toLowerCase().includes(query))
  if (sort) matches.sort((a, b) => (sort === 'asc' ? a.students - b.students : b.students - a.students) || a.id - b.id)

  const pages = Math.max(1, Math.ceil(matches.length / size))
  const page = Math.min(view.page, pages)
  const start = (page - 1) * size
  const rows = matches.slice(start, start + size)

  useEffect(() => {
    const onPopState = () => setView(readUrl())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  function go(patch: Partial<View>, replace = false) {
    const next = { ...view, page, ...patch }
    const params = new URLSearchParams({ page: String(next.page), size: String(next.size) })
    if (next.q) params.set('q', next.q)
    if (next.sort) params.set('sort', next.sort)
    history[replace ? 'replaceState' : 'pushState'](null, '', `?${params}${location.hash}`)
    setView(next)
  }

  return (
    <div className="login">
      <h1>Agent Overview</h1>
      <Input label="Search" value={q} onChange={value => go({ q: value, page: 1 }, true)} />
      <Select label="Rows per page" value={size} options={SIZES} onChange={value => go({ size: value, page: 1 })} />
      {rows.length === 0 ? (
        <p role="status">No agents found for "{q.trim()}".</p>
      ) : (
        <table className="fees">
          <thead>
            <tr>
              <th>Agency</th>
              <th aria-sort={sort === 'asc' ? 'ascending' : sort === 'desc' ? 'descending' : 'none'}>
                <Button type="button" onClick={() => go({ sort: sort === 'asc' ? 'desc' : 'asc', page: 1 })}>
                  Students <span aria-hidden="true">{sort === 'asc' ? '▲' : sort === 'desc' ? '▼' : ''}</span>
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(a => (
              <tr key={a.id}><td>{a.name}</td><td>{a.students}</td></tr>
            ))}
          </tbody>
        </table>
      )}
      {rows.length > 0 && (
        <p aria-live="polite">Showing {start + 1}–{start + rows.length} of {matches.length} agents</p>
      )}
      <nav className="pager" aria-label="Pagination">
        <Button type="button" disabled={page === 1} onClick={() => go({ page: page - 1 })}>Previous</Button>
        <span aria-current="page">Page {page} of {pages}</span>
        <Button type="button" disabled={page === pages} onClick={() => go({ page: page + 1 })}>Next</Button>
      </nav>
    </div>
  )
}
