export const jwt = () => ({
  privateKey: process.env.PW_JWT_PRIVATE_KEY,
  algorithm: process.env.PW_JWT_ALGORITHM,
  signupRequestExpiresIn: process.env.PW_JWT_SIGNUP_REQUEST_EXPIRES_IN,
  passwordChangeRequestExpiresIn:
    process.env.PW_JWT_PASSWORD_CHANGE_REQUEST_EXPIRES_IN,
});
