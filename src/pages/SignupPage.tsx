import { useState, type FormEvent } from 'react'
import { Button, Input } from '../components/ui'

/** Strong = at least 12 characters with letters, numbers and symbols. Anything else is weak. */
export function passwordStrength(password: string): 'Weak' | 'Strong' {
  const strong =
    password.length >= 12 &&
    /[a-z]/i.test(password) &&
    /\d/.test(password) &&
    /[^a-z\d]/i.test(password)
  return strong ? 'Strong' : 'Weak'
}

export function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)
  const strength = passwordStrength(password)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setDone(true)
  }

  if (done) return <p className="welcome">Account created for {name || email}!</p>

  return (
    <form className="login" onSubmit={onSubmit}>
      <h1>Create your EduPay account</h1>
      <Input label="Name" value={name} onChange={setName} />
      <Input label="Email" type="email" value={email} onChange={setEmail} />
      <Input label="Password" type="password" value={password} onChange={setPassword} />
      {password && (
        <p className={`strength strength-${strength.toLowerCase()}`} aria-live="polite">
          Password strength: {strength}
        </p>
      )}
      <Button type="submit">Sign up</Button>
    </form>
  )
}
