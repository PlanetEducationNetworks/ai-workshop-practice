import { useState, type FormEvent } from 'react'
import { Button, Input } from '../components/ui'

export function passwordStrength(password: string): 'Weak' | 'Strong' {
  const strong =
    password.length >= 10 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  return strong ? 'Strong' : 'Weak'
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
      {password && (
        <p className="strength" data-strength={passwordStrength(password).toLowerCase()}>
          {passwordStrength(password)}
        </p>
      )}
      <Button type="submit">Sign up</Button>
    </form>
  )
}
