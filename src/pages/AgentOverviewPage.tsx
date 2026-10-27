import { useEffect, useRef, useState } from 'react'
import { AGENTS } from '../data/agents'
import { Button, Input, Select } from '../components/ui'

const SIZES = [10, 25, 50]

type Sort = 'asc' | 'desc' | null
type View = { page: number; size: number; q: string; sort: Sort }

// Digits only: "0x19", "1e1" and "2.5" are not numbers here. Anything else is NaN and falls back.
const digits = (s: string | null) => (s !== null && /^\d+$/.test(s) ? Number(s) : NaN)

// The view lives in the query string (before the #agents hash). Bad values fall back instead of breaking.
function readUrl(): View {
  const params = new URLSearchParams(location.search)
  const size = digits(params.get('size'))
  const page = digits(params.get('page'))
  const sort = params.get('sort')
  return {
    page: page >= 1 ? page : 1,
    size: SIZES.includes(size) ? size : SIZES[0],
    q: params.get('q') ?? '',
    sort: sort === 'asc' || sort === 'desc' ? sort : null,
  }
}

// Admin > Finance > Agent Overview. Open /#agents.
export function AgentOverviewPage() {
  const [view, setView] = useState(readUrl)
  const { size, q, sort } = view
  const pager = useRef<HTMLElement>(null)
  const pagerClicked = useRef(false)

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

  // A button that was just pressed can become disabled (first/last page). Keep keyboard focus in the pager.
  useEffect(() => {
    if (!pagerClicked.current) return
    pagerClicked.current = false
    const active = document.activeElement
    if (!active || active === document.body || (active instanceof HTMLButtonElement && active.disabled)) {
      // Previous went away (page 1): continue with Next. Next went away (last page): go back to Previous.
      const buttons = pager.current?.querySelectorAll('button')
      buttons?.[page === 1 ? buttons.length - 1 : 0].focus()
    }
  }, [page])

  function go(patch: Partial<View>, replace = false) {
    const next = { ...view, page, ...patch }
    const params = new URLSearchParams(location.search)
    params.set('page', String(next.page))
    params.set('size', String(next.size))
    if (next.q) params.set('q', next.q)
    else params.delete('q')
    if (next.sort) params.set('sort', next.sort)
    else params.delete('sort')
    history[replace ? 'replaceState' : 'pushState'](null, '', `?${params}${location.hash}`)
    setView(next)
  }

  function step(delta: number) {
    pagerClicked.current = true
    go({ page: page + delta })
  }

  return (
    <div className="agents-page">
      <p className="crumbs">Admin / Finance</p>
      <h1>Agent Overview</h1>
      <p className="subtitle">Every agency and the number of students linked to it.</p>
      <div className="card">
        <div className="toolbar">
          {/* The first keystroke of a search adds a history entry (so Back leaves the search); more typing replaces it. */}
          <Input
            label="Search"
            placeholder="Search agencies"
            value={q}
            onChange={value => go({ q: value, page: 1 }, q !== '')}
          />
        </div>
        {rows.length > 0 ? (
          <div className="table-wrap">
            <table className="agents">
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
          </div>
        ) : (
          <div className="empty">
            <p>Check the spelling, or try part of the agency name.</p>
            <Button type="button" onClick={() => go({ q: '', page: 1 })}>Clear search</Button>
          </div>
        )}
        <div className="pager-bar">
          <div className="rows">
            <Select label="Rows per page" value={size} options={SIZES} onChange={value => go({ size: value, page: 1 })} />
            {/* One live region that is always on the page, so screen readers announce both the count and the empty message. */}
            <p aria-live="polite">
              {rows.length === 0
                ? `No agents found for "${q.trim()}".`
                : `Showing ${start + 1}–${start + rows.length} of ${matches.length} agents`}
            </p>
          </div>
          <nav className="pager" aria-label="Pagination" ref={pager}>
            <Button type="button" disabled={page === 1} onClick={() => step(-1)}>
              <span aria-hidden="true">‹</span> Previous
            </Button>
            {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
              <Button
                key={n}
                type="button"
                className="btn page-number"
                aria-label={`Page ${n}`}
                aria-current={n === page ? 'page' : undefined}
                onClick={() => n !== page && step(n - page)}
              >
                {n}
              </Button>
            ))}
            <span className="phone-status">Page {page} of {pages}</span>
            <Button type="button" disabled={page === pages} onClick={() => step(1)}>
              Next <span aria-hidden="true">›</span>
            </Button>
          </nav>
        </div>
      </div>
    </div>
  )
}
