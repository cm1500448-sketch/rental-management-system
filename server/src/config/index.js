import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://postgres:password@localhost:5432/rental_management',
  jwtSecret: process.env.JWT_SECRET ?? 'change-me-in-production',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS ?? '10', 10),
};
