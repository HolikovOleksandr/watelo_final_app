export default () => ({
  port: +process.env.PORT,
  database: {
    host: process.env.PG_HOST,
    port: +process.env.PG_PORT,
    username: process.env.PG_USERNAME,
    name: process.env.PG_DATABASE_NAME,
    password: process.env.PG_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expires: process.env.JWT_EXPIRES,
  },
  bot: {
    token: process.env.BOT_TOKEN,
  },
  hash: {
    salt: process.env.HASH_SALT,
  },
});
