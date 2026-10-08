import { useState, type FormEvent } from 'react'
import { Button, Input } from '../components/ui'

function passwordStrength(password: string): 'Weak' | 'Strong' | null {
  if (!password) return null
  const longEnough = password.length >= 12
  const hasLetter = /[A-Za-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSymbol = /[^A-Za-z0-9]/.test(password)
  if (longEnough && hasLetter && hasNumber && hasSymbol) return 'Strong'
  return 'Weak'
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
      {strength && (
        <p className={`strength ${strength.toLowerCase()}`}>{strength}</p>
      )}
      <Button type="submit">Sign up</Button>
    </form>
  )
}
