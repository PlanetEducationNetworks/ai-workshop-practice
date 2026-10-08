import { useId } from 'react'

type InputProps = {
  label: string
  type?: 'text' | 'email' | 'password'
  value: string
  onChange: (value: string) => void
  /** Shows a red message under the field and marks it invalid. */
  error?: string
  /** Shows a neutral message under the field. For guidance, not for errors. */
  hint?: string
  /** Colour for the hint: plain, amber or green. */
  hintTone?: 'neutral' | 'caution' | 'good'
}

export function Input({ label, type = 'text', value, onChange, error, hint, hintTone = 'neutral' }: InputProps) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ')
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
      />
      {error && (
        <p id={errorId} className="error" role="alert">
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className={`hint hint--${hintTone}`} aria-live="polite">
          {hint}
        </p>
      )}
    </div>
  )
}
