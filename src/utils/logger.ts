import pino from "pino";
import { Environment, env } from "../config/env";

export const logger = pino({
  transport:
    env.APP.ENV === Environment.DEVELOPMENT
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});
