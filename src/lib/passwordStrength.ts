export type PasswordStrength = 'Weak' | 'Medium' | 'Strong'

/** Strong = 12+ characters with letters, numbers and symbols. Medium = 8+ characters with two of those. */
export function passwordStrength(password: string): PasswordStrength {
  const kinds = [/[a-z]/i, /\d/, /[^a-z\d]/i].filter(re => re.test(password)).length
  if (password.length >= 12 && kinds === 3) return 'Strong'
  if (password.length >= 8 && kinds >= 2) return 'Medium'
  return 'Weak'
}
