import { Environment } from "./config/env";

export interface IENVIRONMENT {
  APP: {
    NAME: string;
    PORT: number;
    ENV: Environment;
    CLIENT?: string;
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
    CLOUD_UPLOAD_PRESET: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
    CLOUDINARY_CLOUD_NAME: string;
  };
}

export interface ExtendedError extends Error {
  statusCode?: number;
  errors?: unknown;
}
