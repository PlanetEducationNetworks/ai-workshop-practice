export type PasswordStrength = 'Weak' | 'Strong'

/** Strong = at least 12 characters with letters, numbers and symbols. Anything else is Weak. */
export function passwordStrength(password: string): PasswordStrength {
  const isLong = password.length >= 12
  const hasLetter = /[a-z]/i.test(password)
  const hasNumber = /\d/.test(password)
  const hasSymbol = /[^a-z0-9]/i.test(password)
  return isLong && hasLetter && hasNumber && hasSymbol ? 'Strong' : 'Weak'
}
