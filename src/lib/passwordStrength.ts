export type PasswordStrength = 'Weak' | 'Strong'

/** Strong = at least 12 characters with letters, numbers and symbols. Anything else is Weak. */
export function passwordStrength(password: string): PasswordStrength | null {
  if (!password) return null
  const strong =
    password.length >= 12 &&
    /[a-z]/i.test(password) &&
    /\d/.test(password) &&
    /[^a-z\d]/i.test(password)
  return strong ? 'Strong' : 'Weak'
}
