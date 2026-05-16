import { Request, Response, NextFunction } from "express";
import { validateCreateTeam } from "../../../middlewares/validate-create-team.middleware";
import { ValidationError } from "../../../errors/AppError";

function buildReq(body: Record<string, unknown>): Request {
  return { body } as Request;
}

const res = {} as Response;

function captureNext(): { next: NextFunction; received: () => unknown } {
  let received: unknown;
  const next: NextFunction = (arg?: unknown) => {
    received = arg;
  };

  return { next, received: () => received };
}

describe("validateCreateTeam middleware", () => {
  it("calls next() with no argument for a valid payload", () => {
    const { next, received } = captureNext();

    validateCreateTeam(buildReq({ code: "TEAM-001", name: "Engineering" }), res, next);

    expect(received()).toBeUndefined();
  });

  it("passes ValidationError when 'code' is missing", () => {
    const { next, received } = captureNext();

    validateCreateTeam(buildReq({ name: "Engineering" }), res, next);

    expect(received()).toBeInstanceOf(ValidationError);
    expect((received() as ValidationError).message).toMatch(/code/i);
    expect((received() as ValidationError).statusCode).toBe(400);
  });

  it("passes ValidationError when 'code' is not a string", () => {
    const { next, received } = captureNext();

    validateCreateTeam(buildReq({ code: 123, name: "Engineering" }), res, next);

    expect(received()).toBeInstanceOf(ValidationError);
    expect((received() as ValidationError).message).toMatch(/code/i);
  });

  it("passes ValidationError when 'code' is an empty string", () => {
    const { next, received } = captureNext();

    validateCreateTeam(buildReq({ code: "   ", name: "Engineering" }), res, next);

    expect(received()).toBeInstanceOf(ValidationError);
    expect((received() as ValidationError).message).toMatch(/code/i);
  });

  it("passes ValidationError when 'name' is missing", () => {
    const { next, received } = captureNext();

    validateCreateTeam(buildReq({ code: "TEAM-001" }), res, next);

    expect(received()).toBeInstanceOf(ValidationError);
    expect((received() as ValidationError).message).toMatch(/name/i);
  });
});