import { useId, useState } from 'react'

type SelectProps = {
  label: string
  value: number
  options: number[]
  onChange: (value: number) => void
}

export function Select({ label, value, options, onChange }: SelectProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  return (
    <div className="select">
      <span id={`${id}-label`}>{label}</span>
      <button
        type="button"
        className="select-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-btn`}
        id={`${id}-btn`}
        onClick={() => setOpen(o => !o)}
      >
        {value}
      </button>
      {open && (
        <ul role="listbox" aria-labelledby={`${id}-label`} className="select-menu">
          {options.map(o => (
            <li
              key={o}
              role="option"
              aria-selected={o === value}
              onClick={() => {
                onChange(o)
                setOpen(false)
              }}
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
