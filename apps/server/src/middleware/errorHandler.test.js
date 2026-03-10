import { describe, it, expect, vi } from "vitest";
import { errorHandler } from "./errorHandler.js";
import { AppError } from "../shared/errors/AppError.js";

describe("errorHandler", () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
  const next = vi.fn();

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
  });
});
