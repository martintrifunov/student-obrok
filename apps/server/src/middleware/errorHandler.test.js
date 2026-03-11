import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { errorHandler } from "./errorHandler.js";
import { AppError } from "../shared/errors/AppError.js";
import { ValidationError } from "../shared/errors/ValidationError.js";

describe("errorHandler", () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
  const next = vi.fn();
  // Silence console.error before each test
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  // Restore it after each test so we don't break console.error globally
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns statusCode and errors object for ValidationError", () => {
    const err = new ValidationError({ title: "This field cannot be blank." });
    errorHandler(err, {}, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      title: "This field cannot be blank.",
    });
  });

  it("returns statusCode and message for AppError", () => {
    const err = new AppError("Not found", 404);
    errorHandler(err, {}, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Not found" });
  });

  it("returns 500 for unknown errors", () => {
    const err = new Error("Something exploded");
    errorHandler(err, {}, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server error.",
    });
    expect(console.error).toHaveBeenCalledWith(err);
  });
});
