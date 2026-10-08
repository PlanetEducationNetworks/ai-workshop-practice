import { useState, type FormEvent } from 'react'
import { Button, Input } from '../components/ui'

export type PasswordStrength = 'Weak' | 'Strong'

/** Strong = at least 12 characters with a letter, a number and a symbol. Anything else is Weak. */
export function passwordStrength(password: string): PasswordStrength {
  const long = password.length >= 12
  const hasLetter = /[a-z]/i.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSymbol = /[^a-z0-9]/i.test(password)
  return long && hasLetter && hasNumber && hasSymbol ? 'Strong' : 'Weak'
}

export function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)

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
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        hint={password ? `Password strength: ${passwordStrength(password)}` : undefined}
      />
      <Button type="submit">Sign up</Button>
    </form>
  )
}
