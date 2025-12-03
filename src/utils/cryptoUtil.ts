import bcrypt from "bcryptjs";
import { env } from "../config/env";

export class CryptoUtil {
  private static saltRounds = Number(env.AUTH.BCRYPT_SALT_ROUNDS) || 10;

  static async hash(value: string): Promise<string> {
    return bcrypt.hash(value, this.saltRounds);
  }

  static async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
