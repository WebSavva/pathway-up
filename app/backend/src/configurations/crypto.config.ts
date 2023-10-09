export const crypto  = () => ({
  passwordHashSaltRounds: +process.env.PASSWORD_HASH_SALT_ROUNDS
})
