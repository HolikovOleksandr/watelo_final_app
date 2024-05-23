export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  database: {
    host: process.env.PG_HOST,
    port: +process.env.PG_PORT || 5432,
    username: process.env.PG_USERNAME || 'postgres',
    name: process.env.PG_DATABASE_NAME || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expires: process.env.JWT_EXPIRES,
  },
  bot: {
    token: process.env.BOT_TOKEN,
  },
});
