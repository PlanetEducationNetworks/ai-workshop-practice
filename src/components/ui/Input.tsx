import { useId } from 'react'

type InputProps = {
  label: string
  type?: 'text' | 'email' | 'password'
  value: string
  onChange: (value: string) => void
  /** Shows a red message under the field and marks it invalid. */
  error?: string
  /** Shows a neutral helper message under the field (not an error). */
  hint?: string
}

export function Input({ label, type = 'text', value, onChange, error, hint }: InputProps) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      />
      {hint && (
        <p id={hintId} className="hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
