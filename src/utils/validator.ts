import { ObjectSchema } from "joi";
import ErrorResponse from "./errorResponse";

export const validate = <T = any>(
  schema: ObjectSchema<T>,
  payload: unknown
): T => {
  const { error, value } = schema.validate(payload, { abortEarly: false });

  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    throw new ErrorResponse(message, 400);
  }

  return value;
};
