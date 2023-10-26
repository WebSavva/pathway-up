export const crypto  = () => ({
  passwordHashSaltRounds: +process.env.PW_PASSWORD_HASH_SALT_ROUNDS
})
