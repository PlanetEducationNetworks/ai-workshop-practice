import { useState, type FormEvent } from 'react'
import { Button, Input } from '../components/ui'

type Strength = { label: 'Weak' | 'Medium' | 'Strong'; tone: 'caution' | 'neutral' | 'good' }

/** Rough strength check: how many kinds of character, and how long. */
function passwordStrength(password: string): Strength {
  const variety =
    Number(/[a-z]/.test(password)) +
    Number(/[A-Z]/.test(password)) +
    Number(/\d/.test(password)) +
    Number(/[^a-zA-Z0-9]/.test(password))

  if (password.length >= 12 && variety >= 3) return { label: 'Strong', tone: 'good' }
  if (password.length >= 8 && variety >= 2) return { label: 'Medium', tone: 'neutral' }
  return { label: 'Weak', tone: 'caution' }
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

  if (done) {
    const holder = name || email || 'Your account'
    return (
      <div className="created">
        <h1>Account created</h1>
        <div className="pass">
          <span className="pass-brand">EduPay</span>
          <div className="pass-holder">
            <p className="pass-name">{holder}</p>
            {name && email && <p className="pass-email">{email}</p>}
          </div>
        </div>
        <p className="created-next">Log in with your password to get started.</p>
        <Button type="button" onClick={() => { location.href = '/' }}>Log in</Button>
      </div>
    )
  }

  const strength = password ? passwordStrength(password) : null

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
        hint={strength ? `Password strength: ${strength.label}` : undefined}
        hintTone={strength?.tone}
      />
      <Button type="submit">Sign up</Button>
    </form>
  )
}
