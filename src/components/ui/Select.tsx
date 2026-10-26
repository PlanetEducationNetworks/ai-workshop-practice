import { useId } from 'react'

type SelectProps = {
  label: string
  value: number
  options: number[]
  onChange: (value: number) => void
}

export function Select({ label, value, options, onChange }: SelectProps) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={e => onChange(Number(e.target.value))}>
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}
