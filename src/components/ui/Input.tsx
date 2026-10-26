import { useId, type Ref } from 'react'

type InputProps = {
  label: string
  type?: 'text' | 'email' | 'password'
  value: string
  onChange: (value: string) => void
  /** Shows a red message under the field and marks it invalid. */
  error?: string
  inputRef?: Ref<HTMLInputElement>
}

export function Input({ label, type = 'text', value, onChange, error, inputRef }: InputProps) {
  const id = useId()
  const errorId = `${id}-error`
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
