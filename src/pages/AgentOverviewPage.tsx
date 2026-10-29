import { useEffect, useRef, useState } from 'react'
import { AGENTS } from '../data/agents'
import { Button, Input, Menu, Select } from '../components/ui'

const SIZES = [10, 25, 50]
const COUNTRIES = [...new Set(AGENTS.map(a => a.country))].sort()
const COUNTRY_OPTIONS = [{ value: '', label: 'All countries' }, ...COUNTRIES.map(c => ({ value: c, label: c }))]
const RANGES = [
  { value: 'any', label: 'Any number', has: () => true },
  { value: 'none', label: 'None', has: (n: number) => n === 0 },
  { value: '1-10', label: '1–10', has: (n: number) => n >= 1 && n <= 10 },
  { value: '11-25', label: '11–25', has: (n: number) => n >= 11 && n <= 25 },
  { value: '26+', label: '26 or more', has: (n: number) => n >= 26 },
]

type Sort = 'asc' | 'desc' | null
type View = { page: number; size: number; q: string; sort: Sort; country: string; students: string }

// Digits only: "0x19", "1e1" and "2.5" are not numbers here. Anything else is NaN and falls back.
const digits = (s: string | null) => (s !== null && /^\d+$/.test(s) ? Number(s) : NaN)

// The view lives in the query string (before the #agents hash). Bad values fall back instead of breaking.
function readUrl(): View {
  const params = new URLSearchParams(location.search)
  const size = digits(params.get('size'))
  const page = digits(params.get('page'))
  const sort = params.get('sort')
  const country = params.get('country') ?? ''
  const students = params.get('students') ?? ''
  return {
    page: page >= 1 ? page : 1,
    size: SIZES.includes(size) ? size : SIZES[0],
    q: params.get('q') ?? '',
    sort: sort === 'asc' || sort === 'desc' ? sort : null,
    country: COUNTRIES.includes(country) ? country : '',
    students: RANGES.some(r => r.value === students) ? students : 'any',
  }
}

// Admin > Finance > Agent Overview. Open /#agents.
export function AgentOverviewPage() {
  const [view, setView] = useState(readUrl)
  const { size, q, sort, country, students } = view
  const toolbar = useRef<HTMLDivElement>(null)
  const pager = useRef<HTMLElement>(null)
  const pagerClicked = useRef(false)

  const query = q.trim().toLowerCase()
  const range = RANGES.find(r => r.value === students)!
  const matches = AGENTS.filter(
    a => a.name.toLowerCase().includes(query) && (!country || a.country === country) && range.has(a.students),
  )
  if (sort) matches.sort((a, b) => (sort === 'asc' ? a.students - b.students : b.students - a.students) || a.id - b.id)

  const pages = Math.max(1, Math.ceil(matches.length / size))
  const page = Math.min(view.page, pages)
  const start = (page - 1) * size
  const rows = matches.slice(start, start + size)
  const filtersOn = country !== '' || students !== 'any'
  const hasQuery = query !== ''

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
    if (next.country) params.set('country', next.country)
    else params.delete('country')
    if (next.students !== 'any') params.set('students', next.students)
    else params.delete('students')
    history[replace ? 'replaceState' : 'pushState'](null, '', `?${params}${location.hash}`)
    setView(next)
  }

  function step(delta: number) {
    pagerClicked.current = true
    go({ page: page + delta })
  }

  // Clearing removes the button that was pressed, so keyboard focus goes back to the Search box.
  function clear(patch: Partial<View>) {
    go({ ...patch, page: 1 })
    toolbar.current?.querySelector('input')?.focus()
  }
  const noFilters = { country: '', students: 'any' }

  const emptyTitle = hasQuery ? `No agencies match “${q.trim()}”` : 'No agencies match these filters'
  const emptyHint =
    hasQuery && filtersOn
      ? 'Try a different search, country or student range.'
      : hasQuery
        ? 'Check the spelling, or try part of the agency name.'
        : 'Try a different country or student range.'
  const emptyAction = hasQuery && filtersOn ? 'Clear search and filters' : hasQuery ? 'Clear search' : 'Clear filters'

  return (
    <div className="agents-page">
      <p className="crumbs">Admin / Finance</p>
      <h1>Agent Overview</h1>
      <p className="subtitle">Every agency and the number of students linked to it.</p>
      <div className="card">
        <div className="toolbar" ref={toolbar}>
          <div className="search">
            {/* The first keystroke of a search adds a history entry (so Back leaves the search); more typing replaces it. */}
            <Input
              label="Search"
              placeholder="Search agencies"
              value={q}
              onChange={value => go({ q: value, page: 1 }, q !== '')}
            />
            {q && (
              <Button type="button" className="search-clear" aria-label="Clear search" onClick={() => clear({ q: '' })}>
                <span className="icon icon-x" aria-hidden="true" />
              </Button>
            )}
          </div>
          <p className="count">
            {matches.length} {matches.length === 1 ? 'agency' : 'agencies'}
          </p>
          <div className="filters" role="group" aria-label="Filters">
            <Menu
              label="Country"
              options={COUNTRY_OPTIONS}
              value={country}
              onChange={value => go({ country: value, page: 1 })}
            />
            <Menu label="Students" options={RANGES} value={students} onChange={value => go({ students: value, page: 1 })} />
            {filtersOn && (
              <Button type="button" className="btn link" onClick={() => go({ ...noFilters, page: 1 })}>
                Clear filters
              </Button>
            )}
          </div>
        </div>
        <div className="table-wrap">
          <table className="agents">
            <thead>
              <tr>
                <th>Agency</th>
                <th>Country</th>
                <th aria-sort={sort === 'asc' ? 'ascending' : sort === 'desc' ? 'descending' : 'none'}>
                  <Button type="button" onClick={() => go({ sort: sort === 'asc' ? 'desc' : 'asc', page: 1 })}>
                    Students <span aria-hidden="true">{sort === 'asc' ? '▲' : sort === 'desc' ? '▼' : ''}</span>
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(a => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td>{a.country}</td>
                  <td>{a.students}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <div className="empty">
            <span className="empty-icon" aria-hidden="true">
              <span className="icon icon-search-lg" />
            </span>
            <div role="status">
              <h2>{emptyTitle}</h2>
              <p>{emptyHint}</p>
            </div>
            <Button
              type="button"
              onClick={() => clear({ ...(hasQuery ? { q: '' } : {}), ...(filtersOn ? noFilters : {}) })}
            >
              {emptyAction}
            </Button>
          </div>
        )}
        <div className="pager-bar" hidden={rows.length === 0}>
          <div className="rows">
            <Select label="Rows per page" value={size} options={SIZES} onChange={value => go({ size: value, page: 1 })} />
            {/* The status is always on the page, so screen readers announce it when it changes. */}
            <p role="status" aria-live="polite">
              {rows.length > 0 && `Showing ${start + 1}–${start + rows.length} of ${matches.length} agents`}
            </p>
          </div>
          <nav className="pager" aria-label="Pagination" ref={pager}>
            <Button type="button" disabled={page === 1} onClick={() => step(-1)}>
              <span className="icon icon-left" aria-hidden="true" />
              Previous
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
              Next
              <span className="icon icon-right" aria-hidden="true" />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  )
}
