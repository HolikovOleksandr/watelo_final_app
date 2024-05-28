export default () => ({
  port: +process.env.PORT,
  env: process.env.NODE_ENV,
  database: {
    host: process.env.PG_HOST,
    port: +process.env.PG_PORT,
    username: process.env.PG_USERNAME,
    name: process.env.PG_DATABASE,
    testName: process.env.TEST_PG_DATABASE,
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
