import { describe, it, expect, vi } from "vitest";
import { validateRequest } from "./validateRequest.js";
import { ValidationError } from "../shared/errors/ValidationError.js";
import { z } from "zod";

const schema = z.object({ name: z.string() });

describe("validateRequest", () => {
  it("calls next with formatted ValidationError on invalid body", () => {
    const req = { body: { name: 123 } };
    const res = {};
    const next = vi.fn();
    validateRequest(schema)(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));

    const errorArg = next.mock.calls[0][0];
    expect(errorArg.errors).toHaveProperty("name");
  });

  it("mutates req.body with parsed data and calls next on valid input", () => {
    const req = { body: { name: "maco" } };
    const res = {};
    const next = vi.fn();
    validateRequest(schema)(req, res, next);
    expect(req.body).toEqual({ name: "maco" });
    expect(next).toHaveBeenCalledWith();
  });

  it("handles query source via Object.defineProperty", () => {
    const req = { body: {} };
    Object.defineProperty(req, "query", {
      get: () => ({ name: "maco" }),
      configurable: true,
    });
    const res = {};
    const next = vi.fn();
    validateRequest(schema, "query")(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("calls next with ValidationError on invalid query", () => {
    const req = { body: {} };
    Object.defineProperty(req, "query", {
      get: () => ({ name: 123 }),
      configurable: true,
    });
    const res = {};
    const next = vi.fn();
    validateRequest(schema, "query")(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
  });
});
