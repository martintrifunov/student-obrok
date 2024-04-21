const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  process.env.SERVER_ORIGIN,
  process.env.DATABASE_ORIGIN,
];

export default allowedOrigins;
