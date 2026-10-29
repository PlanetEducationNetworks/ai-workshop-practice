import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

type Option = { value: string; label: string }

type MenuProps = {
  /** Button text while nothing is chosen, for example "Country". */
  label: string
  /** The first option means "no filter". */
  options: Option[]
  value: string
  onChange: (value: string) => void
}

/** A button that opens a list of single-choice options. Arrow keys, Home/End, Enter and Escape work. */
export function Menu({ label, options, value, onChange }: MenuProps) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const items = useRef<(HTMLButtonElement | null)[]>([])
  const name = `Filter by ${label.toLowerCase()}`
  const selected = options.findIndex(o => o.value === value)
  const active = selected > 0

  useEffect(() => {
    if (!open) return
    items.current[Math.max(selected, 0)]?.focus()
    const closeOnOutsideClick = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [open])

  function choose(next: string) {
    setOpen(false)
    trigger.current?.focus()
    onChange(next)
  }

  function onKeyDown(e: KeyboardEvent) {
    const focusItem = (i: number) => {
      e.preventDefault()
      items.current[(i + options.length) % options.length]?.focus()
    }
    const current = items.current.findIndex(el => el === document.activeElement)
    if (e.key === 'ArrowDown') focusItem(current + 1)
    else if (e.key === 'ArrowUp') focusItem(current - 1)
    else if (e.key === 'Home') focusItem(0)
    else if (e.key === 'End') focusItem(options.length - 1)
    else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      trigger.current?.focus()
    } else if (e.key === 'Tab') setOpen(false)
  }

  return (
    <div className="menu-wrap" ref={root}>
      <button
        ref={trigger}
        type="button"
        className={`btn menu-trigger${active ? ' is-active' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={active ? `${name}: ${options[selected].label}` : name}
        onClick={() => setOpen(!open)}
      >
        {active ? `${label}: ${options[selected].label}` : label}
        <span className="icon icon-down" aria-hidden="true" />
      </button>
      {open && (
        <div className="menu" role="menu" aria-label={name} onKeyDown={onKeyDown}>
          {options.map((o, i) => (
            <button
              key={o.value}
              ref={el => {
                items.current[i] = el
              }}
              type="button"
              role="menuitemradio"
              aria-checked={i === selected}
              className={`menu-item${i === selected ? ' is-selected' : ''}`}
              onClick={() => choose(o.value)}
            >
              {o.label}
              {i === selected && <span className="icon icon-check" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
