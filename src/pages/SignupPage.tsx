import { useState, type FormEvent } from 'react'
import { Button, Input } from '../components/ui'
import { passwordStrength } from '../lib/passwordStrength'

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
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        hint={strength ? `Password strength: ${strength}` : undefined}
      />
      <Button type="submit">Sign up</Button>
    </form>
  )
}
