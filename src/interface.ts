import { Environment } from "./config/env";

export interface IENVIRONMENT {
  APP: {
    NAME: string;
    PORT: number;
    ENV: Environment;
    CLIENT?: string;
    FRONTEND_URL: string;
  };
  DB: {
    URL: string;
  };
  AUTH: {
    JWT_SECRET: string;
    JWT_EXPIRES: string;
    BCRYPT_SALT_ROUNDS: number;
  };
  EMAIL: {
    BREVO_SENDER_EMAIL: string;
    BREVO_API_KEY: string;
  };
  CLOUDINARY: {
    UPLOAD_PRESET: string;
    API_KEY: string;
    API_SECRET: string;
    CLOUD_NAME: string;
  };

  PAYSTACK: {
    SECRET_KEY: string;
    PUBLIC_KEY: string;
  };
}

export interface ExtendedError extends Error {
  statusCode?: number;
  errors?: unknown;
}