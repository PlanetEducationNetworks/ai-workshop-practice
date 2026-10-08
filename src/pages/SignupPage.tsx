import { useState, type FormEvent } from 'react'
import { Button, Input } from '../components/ui'

// Strong = 12+ characters with a letter, a number and a symbol. Anything else is Weak.
function passwordStrength(password: string) {
  const strong =
    password.length >= 12 && /[a-z]/i.test(password) && /\d/.test(password) && /[^a-z\d]/i.test(password)
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
        <p className="strength" aria-live="polite">
          {passwordStrength(password)}
        </p>
      )}
      <Button type="submit">Sign up</Button>
    </form>
  )
}
