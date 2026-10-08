export type PasswordStrength = 'Weak' | 'Strong'

/** Strong = at least 12 characters with letters, numbers and symbols. Anything else is Weak. */
export function passwordStrength(password: string): PasswordStrength {
  const long = password.length >= 12
  const hasLetter = /[a-z]/i.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSymbol = /[^a-z0-9]/i.test(password)
  return long && hasLetter && hasNumber && hasSymbol ? 'Strong' : 'Weak'
}
