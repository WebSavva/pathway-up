export const mail = () => ({
  from: process.env.PW_MAIL_FROM,
  host: process.env.PW_MAIL_HOST,
  port: +process.env.PW_MAIL_PORT,
  user: process.env.PW_MAIL_USER,
  password: process.env.PW_MAIL_PASSWORD,
})
