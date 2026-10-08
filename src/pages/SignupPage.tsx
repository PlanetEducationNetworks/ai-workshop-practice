import { useState, type FormEvent } from 'react'
import { Button, Input } from '../components/ui'

function passwordStrength(password: string): 'Weak' | 'Strong' {
  const variety = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(re => re.test(password)).length
  return password.length >= 12 && variety >= 3 ? 'Strong' : 'Weak'
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
      {password && <p className="hint">{passwordStrength(password)}</p>}
      <Button type="submit">Sign up</Button>
    </form>
  )
}
