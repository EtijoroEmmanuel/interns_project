export enum Environment {
  DEVELOPMENT = "development",
  PRODUCTION = "production",
}

import * as dotenv from "dotenv";
import { IENVIRONMENT } from "../interface";

dotenv.config();

const requiredEnvs = [
  "APP_NAME",
  "PORT",
  "NODE_ENV",
  "CLIENT",
  "MONGO_URL",
  "JWT_SECRET",
  "JWT_EXPIRES",
  "BCRYPT_SALT_ROUNDS",
  "BREVO_SENDER_EMAIL",
  "BREVO_API_KEY",
  "PAYSTACK_SECRET_KEY",
  "PAYSTACK_PUBLIC_KEY",
  "FRONTEND_URL",
];

for (const key of requiredEnvs) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env: IENVIRONMENT = {
  APP: {
    NAME: process.env.APP_NAME!,
    PORT: parseInt(process.env.PORT!, 10),
    ENV: (process.env.NODE_ENV as Environment) || Environment.DEVELOPMENT,
    CLIENT: process.env.CLIENT!,
    FRONTEND_URL: process.env.FRONTEND_URL!,
  },

  DB: {
    URL: process.env.MONGO_URL!,
  },

  AUTH: {
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRES: process.env.JWT_EXPIRES!,
    BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS!, 10),
  },

  EMAIL: {
    BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL!,
    BREVO_API_KEY: process.env.BREVO_API_KEY!,
  },

  CLOUDINARY: {
    UPLOAD_PRESET: process.env.UPLOAD_PRESET!,
    API_KEY: process.env.API_KEY!,
    API_SECRET: process.env.API_SECRET!,
    CLOUD_NAME: process.env.CLOUD_NAME!,
  },

  PAYSTACK: {
    SECRET_KEY: process.env.PAYSTACK_SECRET_KEY!,
    PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY!,
  },
};