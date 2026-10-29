import { useEffect, useId, useRef, useState } from 'react'

type SelectProps = {
  label: string
  value: number
  options: number[]
  onChange: (value: number) => void
}

/**
 * Looks like the design: a button that opens a list above it, with a check on the chosen size.
 * The real control is still a native <select>, hidden visually but kept in the page, so keyboards,
 * screen readers and forms work exactly like a normal select. The button and list are for the mouse.
 */
export function Select({ label, value, options, onChange }: SelectProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const closeOnOutsideClick = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [open])

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="select" ref={root}>
        <select id={id} className="select-native" value={value} onChange={e => onChange(Number(e.target.value))}>
          {options.map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <button
          type="button"
          className="select-button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => setOpen(!open)}
          onKeyDown={e => e.key === 'Escape' && setOpen(false)}
        >
          {value}
          <span className="icon icon-down" aria-hidden="true" />
        </button>
        {open && (
          <ul className="select-list" aria-hidden="true" onKeyDown={e => e.key === 'Escape' && setOpen(false)}>
            {options.map(o => (
              <li key={o}>
                <button
                  type="button"
                  tabIndex={-1}
                  className={`select-item${o === value ? ' is-selected' : ''}`}
                  onClick={() => {
                    setOpen(false)
                    onChange(o)
                  }}
                >
                  {o}
                  {o === value && <span className="icon icon-check" aria-hidden="true" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
