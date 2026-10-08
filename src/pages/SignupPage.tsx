import { useState, type FormEvent } from 'react'
import { Button, Input } from '../components/ui'

/**
 * TICKET-13: Strong means long enough and mixed - letters, numbers and symbols.
 * Anything shorter or simpler is Weak.
 */
export function passwordStrength(password: string): 'Weak' | 'Strong' {
  const long = password.length >= 12
  const mixed =
    /[a-z]/i.test(password) && /[0-9]/.test(password) && /[^a-z0-9]/i.test(password)
  return long && mixed ? 'Strong' : 'Weak'
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
      <Input label="Password" type="password" value={password} onChange={setPassword} />
      {password && <p className="strength">{passwordStrength(password)}</p>}
      <Button type="submit">Sign up</Button>
    </form>
  )
}
