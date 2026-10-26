import { useEffect, useState } from 'react'
import { AGENTS } from '../data/agents'
import { Button, Input, Select } from '../components/ui'

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
  const [{ page: rawPage, size }, setParams] = useState(() => readParams(location.search))
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
  // ponytail: case-insensitive "contains" on agency name, Radu to confirm the rules
  const q = query.trim().toLowerCase()
  let list = q ? AGENTS.filter(a => a.name.toLowerCase().includes(q)) : AGENTS
  if (sort) list = [...list].sort((a, b) => (sort === 'asc' ? a.students - b.students : b.students - a.students))
  const total = list.length
  const pages = Math.max(1, Math.ceil(total / size))
  const page = Math.min(rawPage, pages)
  const start = (page - 1) * size
  const end = Math.min(start + size, total)
  return (
    <div className="login">
      <h1>Agent Overview</h1>
      <div className="toolbar">
        <Input
          label="Search agencies"
          value={query}
          onChange={v => {
            setQuery(v)
            go({ page: 1, size }, true)
          }}
        />
        {query && (
          <Button
            type="button"
            onClick={() => {
              setQuery('')
              go({ page: 1, size }, true)
            }}
          >
            Clear search
          </Button>
        )}
        <span>{total} agents</span>
      </div>
      <table className="fees">
        <thead>
          <tr>
            <th>Agency</th>
            <th aria-sort={sort === 'asc' ? 'ascending' : sort === 'desc' ? 'descending' : undefined}>
              <Button
                type="button"
                className="sort-btn"
                onClick={() => {
                  setSort(sort === null ? 'asc' : sort === 'asc' ? 'desc' : null)
                  go({ page: 1, size }, true)
                }}
              >
                Students{sort === 'asc' ? ' ▲' : sort === 'desc' ? ' ▼' : ''}
              </Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {total === 0 ? (
            <tr>
              <td colSpan={2}>
                <strong>No agents match “{query.trim()}”</strong>
                <br />
                Check the spelling and try again.
              </td>
            </tr>
          ) : (
            list.slice(start, end).map(a => (
              <tr key={a.id}><td>{a.name}</td><td>{a.students}</td></tr>
            ))
          )}
        </tbody>
      </table>
      {total > 0 && (
      <nav className="pager" aria-label="Agent pagination">
        <Select
          label="Rows per page"
          value={size}
          options={SIZES}
          onChange={s => {
            go({ page: 1, size: s })
          }}
        />
        <span aria-live="polite">{`${start + 1}–${end} of ${total}`}</span>
        <Button type="button" aria-disabled={page === 1} onClick={() => page > 1 && go({ page: page - 1, size })}>
          Previous
        </Button>
        {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
          <Button key={n} type="button" aria-current={n === page ? 'page' : undefined} onClick={() => go({ page: n, size })}>
            {n}
          </Button>
        ))}
        <Button type="button" aria-disabled={page === pages} onClick={() => page < pages && go({ page: page + 1, size })}>
          Next
        </Button>
      </nav>
      )}
    </div>
  )
}
