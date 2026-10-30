import { useEffect, useRef, useState } from 'react'
import { AGENTS } from '../data/agents'
import { Button, Input, Select } from '../components/ui'

// Admin > Finance > Agent Overview. Open /#agents.
// Sizes and default confirmed by the PM.
const SIZES = [10, 25, 50]

// Anything that isn't a whole page number or an allowed size falls back to the defaults (Radu to confirm).
// Digits only: "0x19" and "1e1" are not numbers here.
const digits = (s: string | null) => (s !== null && /^\d+$/.test(s) ? Number(s) : NaN)
function readParams(search: string) {
  const q = new URLSearchParams(search)
  const size = SIZES.includes(digits(q.get('size'))) ? digits(q.get('size')) : SIZES[0]
  const raw = digits(q.get('page'))
  const page = raw >= 1 ? raw : 1
  return { page: Math.min(page, Math.ceil(AGENTS.length / size)), size }
}

// Figma frame 10: every number up to 7 pages; above that first, last, current ±1, with "…" for gaps.
export function pageItems(page: number, pages: number): (number | '…')[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)
  const keep = [...new Set([1, page - 1, page, page + 1, pages])].filter(n => n >= 1 && n <= pages)
  return keep.flatMap((n, i) => (i && n - keep[i - 1] > 1 ? ['…' as const, n] : [n]))
}

export function AgentOverviewPage() {
  const [{ page: rawPage, size }, setParams] = useState(() => readParams(location.search))
  const searchBox = useRef<HTMLInputElement>(null)
  const pager = useRef<HTMLElement>(null)
  const refocus = useRef(false)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'asc' | 'desc' | null>(null)
  const go = (next: { page: number; size: number }, replace = false) => {
    setParams(next)
    history[replace ? 'replaceState' : 'pushState'](null, '', `?page=${next.page}&size=${next.size}${location.hash}`)
  }
  // Back/Forward change the URL without going through `go`, so re-read it.
  useEffect(() => {
    const onPop = () => setParams(readParams(location.search))
    addEventListener('popstate', onPop)
    return () => removeEventListener('popstate', onPop)
  }, [])
  // A pressed Previous/Next that just became disabled loses focus, so move it to the current page.
  useEffect(() => {
    if (!refocus.current) return
    refocus.current = false
    pager.current?.querySelector<HTMLElement>('[aria-current="page"]')?.focus()
  })
  // ponytail: case-insensitive "contains" on agency name, Radu to confirm the rules
  const q = query.trim().toLowerCase()
  let list = q ? AGENTS.filter(a => a.name.toLowerCase().includes(q)) : AGENTS
  if (sort) list = [...list].sort((a, b) => (sort === 'asc' ? a.students - b.students : b.students - a.students))
  const total = list.length
  const pages = Math.max(1, Math.ceil(total / size))
  const page = Math.min(rawPage, pages)
  const start = (page - 1) * size
  const end = Math.min(start + size, total)
  const clearSearch = () => {
    setQuery('')
    go({ page: 1, size }, true)
    searchBox.current?.focus()
  }
  return (
    <main className="agents">
      <h1>Agent Overview</h1>
      <p className="agents-sub">Every agency and the number of students it has.</p>
      <div className="agents-card">
      <div className="toolbar">
        <div className="search">
          <Input
            inputRef={searchBox}
            label="Search agencies"
            type="search"
            placeholder="Search by agency name"
            value={query}
            onChange={v => {
              setQuery(v)
              go({ page: 1, size }, true)
            }}
          />
          {query && <Button type="button" className="search-clear" aria-label="Clear search text" onClick={clearSearch} />}
        </div>
        <span className="count" aria-live="polite">{total} agents</span>
      </div>
      <table className="agents-table">
        <thead>
          <tr>
            <th>Agency</th>
            {/* The click is on the cell so the whole header sorts; the button's own clicks bubble up to it. */}
            <th
              className="num"
              aria-sort={sort === 'asc' ? 'ascending' : sort === 'desc' ? 'descending' : undefined}
              onClick={() => {
                setSort(sort === null ? 'desc' : sort === 'desc' ? 'asc' : null)
                go({ page: 1, size }, true)
              }}
            >
              <Button type="button" className="sort-btn">
                Students
              </Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {total === 0 ? (
            <tr>
              <td colSpan={2} className="empty">
                <span className="empty-icon" />
                <strong>No agents match “{query.trim()}”</strong>
                <p>Check the spelling, or try part of the agency name.</p>
                <Button type="button" className="secondary" onClick={clearSearch}>
                  Clear search
                </Button>
              </td>
            </tr>
          ) : (
            list.slice(start, end).map(a => (
              <tr key={a.id}>
                {/* Initials come from CSS so the cell text stays just the name. */}
                <td className="agency" data-initials={a.name.split(' ').slice(0, 2).map(w => w[0]).join('')}>{a.name}</td>
                <td className="num">{a.students}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {total > 0 && (
      <nav ref={pager} className="pager" aria-label="Agent pagination">
        <div className="pager-left">
          <Select
            label="Rows per page"
            value={size}
            options={SIZES}
            onChange={s => {
              go({ page: 1, size: s })
            }}
          />
          <span aria-live="polite">{`Showing ${start + 1}–${end} of ${total} agents`}</span>
        </div>
        <div className="pager-pages">
          <Button type="button" className="step prev" disabled={page === 1} onClick={() => {
              refocus.current = page - 1 === 1
              go({ page: page - 1, size })
            }}>
            Previous
          </Button>
          {pageItems(page, pages).map((n, i) => n === '…' ? (
            <span key={`gap${i}`} className="gap" aria-hidden="true">…</span>
          ) : (
            <Button key={n} type="button" className="page" data-of={pages} aria-current={n === page ? 'page' : undefined} onClick={() => go({ page: n, size })}>
              {n}
            </Button>
          ))}
          <Button type="button" className="step next" disabled={page === pages} onClick={() => {
              refocus.current = page + 1 === pages
              go({ page: page + 1, size })
            }}>
            Next
          </Button>
        </div>
      </nav>
      )}
      </div>
    </main>
  )
}
