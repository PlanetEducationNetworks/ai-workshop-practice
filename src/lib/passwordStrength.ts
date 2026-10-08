export type PasswordStrength = 'Weak' | 'Strong'

/** Strong = 12+ characters with a letter, a number and a symbol. Anything else is Weak. */
export function passwordStrength(password: string): PasswordStrength {
  const strong =
    password.length >= 12 &&
    /[a-z]/i.test(password) &&
    /\d/.test(password) &&
    /[^a-z\d]/i.test(password)
  return strong ? 'Strong' : 'Weak'
}
