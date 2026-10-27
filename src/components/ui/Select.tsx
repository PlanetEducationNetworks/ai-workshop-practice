import { useEffect, useId, useRef, useState } from 'react'

type SelectProps = {
  label: string
  value: number
  options: number[]
  onChange: (value: number) => void
}

export function Select({ label, value, options, onChange }: SelectProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const button = useRef<HTMLButtonElement>(null)
  const list = useRef<HTMLUListElement>(null)

  // The list takes focus while open; arrows move `active`, Enter picks it.
  useEffect(() => {
    if (open) list.current?.focus()
  }, [open])

  const openMenu = () => {
    setActive(options.indexOf(value))
    setOpen(true)
  }
  const close = () => {
    setOpen(false)
    button.current?.focus()
  }
  const choose = (o: number) => {
    if (o !== value) onChange(o)
    close()
  }
  const onListKey = (e: React.KeyboardEvent) => {
    const last = options.length - 1
    const moves: Record<string, number> = {
      ArrowDown: Math.min(active + 1, last),
      ArrowUp: Math.max(active - 1, 0),
      Home: 0,
      End: last,
    }
    if (e.key in moves) {
      e.preventDefault()
      setActive(moves[e.key])
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      choose(options[active])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <div className="select">
      <span id={`${id}-label`}>{label}</span>
      <button
        ref={button}
        type="button"
        className="select-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onMouseDown={e => open && e.preventDefault()} // else the list's onBlur closes it first and the click reopens it
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={e => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault()
            openMenu()
          }
        }}
      >
        {/* Named by its own text, so only the list is tied to the visible label. */}
        <span className="sr-only">{label}: </span>
        {value}
      </button>
      {/* Always rendered (hidden while closed) so it can be found and picked from by its label. */}
      <ul
        ref={list}
        hidden={!open}
        role="listbox"
        tabIndex={-1}
        aria-labelledby={`${id}-label`}
        aria-activedescendant={`${id}-opt-${active}`}
        className="select-menu"
        onKeyDown={onListKey}
        onBlur={() => setOpen(false)}
      >
        {options.map((o, i) => (
          <li
            key={o}
            id={`${id}-opt-${i}`}
            role="option"
            aria-selected={o === value}
            className={i === active ? 'active' : undefined}
            onMouseDown={e => e.preventDefault()} // keep focus on the list so onBlur doesn't swallow the click
            onClick={() => choose(o)}
          >
            {o}
          </li>
        ))}
      </ul>
    </div>
  )
}
