export const jwt = () => ({
  privateKey: process.env.JWT_PRIVATE_KEY,
  algorithm: process.env.JWT_ALGORITHM,
  signupRequestExpiresIn: process.env.JWT_SIGNUP_REQUEST_EXPIRES_IN,
  passwordChangeRequestExpiresIn:
    process.env.JWT_PASSWORD_CHANGE_REQUEST_EXPIRES_IN,
});
