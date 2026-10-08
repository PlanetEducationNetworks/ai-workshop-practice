import { useState, type FormEvent } from 'react'
import { Button, Input } from '../components/ui'

/** Weak: short or only one kind of character. Strong: 12+ chars with letters, numbers and symbols. */
export function passwordStrength(password: string): 'Weak' | 'Medium' | 'Strong' {
  const kinds = [/[a-z]/i, /[0-9]/, /[^a-z0-9]/i].filter(re => re.test(password)).length
  if (password.length < 8 || kinds < 2) return 'Weak'
  if (password.length >= 12 && kinds === 3) return 'Strong'
  return 'Medium'
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
