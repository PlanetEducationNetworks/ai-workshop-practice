import { useState, type FormEvent } from 'react'
import { Button, Input } from '../components/ui'
import { signIn } from '../lib/auth'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const res = await signIn(email, password)
    if (res.ok) {
      setUser(res.name)
    } else {
      setError(res.message)
    }
  }

  if (user) return <p className="welcome">Welcome, {user}!</p>

  return (
    <form className="login" onSubmit={onSubmit}>
      <h1>Log in to EduPay</h1>
      <Input label="Email" type="email" value={email} onChange={setEmail} />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={value => {
          setPassword(value)
          setError('')
        }}
        error={error}
      />
      <Button type="submit">Log in</Button>
    </form>
  )
}
