import { Request, Response, NextFunction } from "express";
import { Status } from "@prisma/client";
import { ValidationError } from "../../../errors/AppError";
import { validateUpdatePolicy } from "../../../middlewares/validate-update-policy.middleware";

function buildReq(params: Record<string, unknown>, body: Record<string, unknown>): Request {
  return { params, body } as unknown as Request;
}

const res = {} as Response;

function captureNext(): { next: NextFunction; received: () => unknown } {
  let received: unknown;
  const next: NextFunction = (arg?: unknown) => {
    received = arg;
  };

  return { next, received: () => received };
}

describe("validateUpdatePolicy middleware", () => {
  it("calls next() with no argument for a valid payload", () => {
    const { next, received } = captureNext();

    validateUpdatePolicy(
      buildReq(
        { id: "1" },
        {
          policyName: "Flexible Working Hours",
          baseHours: 7.5,
          coreTimeStart: "10:00",
          coreTimeEnd: "17:30",
          updatedBy: "manager",
          isDefault: false,
          status: Status.ACTIVE,
        }
      ),
      res,
      next
    );

    expect(received()).toBeUndefined();
  });

  it("passes ValidationError when id is invalid", () => {
    const { next, received } = captureNext();

    validateUpdatePolicy(
      buildReq({ id: "0" }, { policyName: "Flexible Working Hours", updatedBy: "manager" }),
      res,
      next
    );

    expect(received()).toBeInstanceOf(ValidationError);
    expect((received() as ValidationError).message).toMatch(/id/i);
  });

  it("passes ValidationError when no updatable fields are provided", () => {
    const { next, received } = captureNext();

    validateUpdatePolicy(buildReq({ id: "1" }, { updatedBy: "manager" }), res, next);

    expect(received()).toBeInstanceOf(ValidationError);
    expect((received() as ValidationError).message).toMatch(/at least one/i);
  });

  it("passes ValidationError when updatedBy is missing", () => {
    const { next, received } = captureNext();

    validateUpdatePolicy(buildReq({ id: "1" }, { policyName: "Flexible Working Hours" }), res, next);

    expect(received()).toBeInstanceOf(ValidationError);
    expect((received() as ValidationError).message).toMatch(/updatedBy/i);
  });

  it("passes ValidationError when coreTimeStart has invalid format", () => {
    const { next, received } = captureNext();

    validateUpdatePolicy(
      buildReq({ id: "1" }, { coreTimeStart: "25:00", updatedBy: "manager" }),
      res,
      next
    );

    expect(received()).toBeInstanceOf(ValidationError);
    expect((received() as ValidationError).message).toMatch(/coreTimeStart/i);
  });

  it("passes ValidationError when status is invalid", () => {
    const { next, received } = captureNext();

    validateUpdatePolicy(
      buildReq({ id: "1" }, { status: "ARCHIVED", updatedBy: "manager" }),
      res,
      next
    );

    expect(received()).toBeInstanceOf(ValidationError);
    expect((received() as ValidationError).message).toMatch(/status/i);
  });
});
