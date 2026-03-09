import { ValidationError } from "../shared/errors/ValidationError.js";

/**
 * Creates a Zod validation middleware.
 *
 * @param {import("zod").ZodSchema} schema - Zod schema to validate against
 * @param {"body" | "params" | "query"} source - Part of request to validate
 */
export const validateRequest = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const message = result.error.errors[0].message;
      return next(new ValidationError(message));
    }

    if (source === "query") {
      Object.defineProperty(req, "query", {
        value: result.data,
        writable: true,
        configurable: true,
      });
    } else {
      req[source] = result.data;
    }

    next();
  };
};
