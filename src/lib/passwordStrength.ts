export type PasswordStrength = 'Weak' | 'Strong'

/** Strong = at least 12 characters with a letter, a number and a symbol. */
export function passwordStrength(password: string): PasswordStrength {
  const strong =
    password.length >= 12 &&
    /[a-z]/i.test(password) &&
    /\d/.test(password) &&
    /[^a-z0-9]/i.test(password)
  return strong ? 'Strong' : 'Weak'
}
