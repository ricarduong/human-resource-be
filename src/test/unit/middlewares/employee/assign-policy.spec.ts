import { Request, Response, NextFunction } from "express";
import { assignPolicy } from "../../../../middlewares/employee/assign-policy";
import { ValidationError } from "../../../../errors/AppError";

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

describe("employee assignPolicy middleware", () => {
  describe("valid payload", () => {
    it("calls next() with no argument when all required fields are correct", () => {
      const { next, received } = captureNext();
      const req = buildReq({
        policyId: 1,
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        priority: 5,
      });
      assignPolicy(req, res, next);
      expect(received()).toBeUndefined();
      expect(req.body.startDate).toBeInstanceOf(Date);
      expect(req.body.endDate).toBeInstanceOf(Date);
    });

    it("calls next() with no argument when endDate is null", () => {
      const { next, received } = captureNext();
      const req = buildReq({
        policyId: 1,
        startDate: "2026-01-01",
        endDate: null,
        priority: 5,
      });
      assignPolicy(req, res, next);
      expect(received()).toBeUndefined();
      expect(req.body.startDate).toBeInstanceOf(Date);
      expect(req.body.endDate).toBeNull();
    });

    it("calls next() with no argument when endDate is undefined", () => {
      const { next, received } = captureNext();
      const req = buildReq({
        policyId: 1,
        startDate: "2026-01-01",
        priority: 5,
      });
      assignPolicy(req, res, next);
      expect(received()).toBeUndefined();
      expect(req.body.startDate).toBeInstanceOf(Date);
      expect(req.body.endDate).toBeUndefined();
    });
  });

  describe("'policyId' field", () => {
    it("passes a ValidationError when 'policyId' is missing", () => {
      const { next, received } = captureNext();
      assignPolicy(
        buildReq({ startDate: "2026-01-01", endDate: "2026-12-31", priority: 5 }),
        res,
        next
      );
      expect(received()).toBeInstanceOf(ValidationError);
      expect((received() as ValidationError).message).toMatch(/policyId/i);
      expect((received() as ValidationError).statusCode).toBe(400);
    });

    it("passes a ValidationError when 'policyId' is not a number", () => {
      const { next, received } = captureNext();
      assignPolicy(
        buildReq({ policyId: "one", startDate: "2026-01-01", endDate: "2026-12-31", priority: 5 }),
        res,
        next
      );
      expect(received()).toBeInstanceOf(ValidationError);
      expect((received() as ValidationError).message).toMatch(/policyId/i);
    });

    it("passes a ValidationError when 'policyId' is not a positive integer", () => {
      const { next, received } = captureNext();
      assignPolicy(
        buildReq({ policyId: -1, startDate: "2026-01-01", endDate: "2026-12-31", priority: 5 }),
        res,
        next
      );
      expect(received()).toBeInstanceOf(ValidationError);
      expect((received() as ValidationError).message).toMatch(/policyId/i);
    });

    it("passes a ValidationError when 'policyId' is not an integer", () => {
      const { next, received } = captureNext();
      assignPolicy(
        buildReq({ policyId: 1.5, startDate: "2026-01-01", endDate: "2026-12-31", priority: 5 }),
        res,
        next
      );
      expect(received()).toBeInstanceOf(ValidationError);
      expect((received() as ValidationError).message).toMatch(/policyId/i);
    });
  });

  describe("'startDate' field", () => {
    it("passes a ValidationError when 'startDate' is missing", () => {
      const { next, received } = captureNext();
      assignPolicy(
        buildReq({ policyId: 1, endDate: "2026-12-31", priority: 5 }),
        res,
        next
      );
      expect(received()).toBeInstanceOf(ValidationError);
      expect((received() as ValidationError).message).toMatch(/startDate/i);
    });

    it("passes a ValidationError when 'startDate' is not a valid date", () => {
      const { next, received } = captureNext();
      assignPolicy(
        buildReq({ policyId: 1, startDate: "invalid-date", endDate: "2026-12-31", priority: 5 }),
        res,
        next
      );
      expect(received()).toBeInstanceOf(ValidationError);
      expect((received() as ValidationError).message).toMatch(/startDate/i);
    });

    it("passes a ValidationError when 'startDate' is not a string", () => {
      const { next, received } = captureNext();
      assignPolicy(
        buildReq({ policyId: 1, startDate: 12345, endDate: "2026-12-31", priority: 5 }),
        res,
        next
      );
      expect(received()).toBeInstanceOf(ValidationError);
      expect((received() as ValidationError).message).toMatch(/startDate/i);
    });
  });

  describe("'endDate' field", () => {
    it("passes a ValidationError when 'endDate' is provided but not a valid date", () => {
      const { next, received } = captureNext();
      assignPolicy(
        buildReq({ policyId: 1, startDate: "2026-01-01", endDate: "invalid-date", priority: 5 }),
        res,
        next
      );
      expect(received()).toBeInstanceOf(ValidationError);
      expect((received() as ValidationError).message).toMatch(/endDate/i);
    });

    it("passes a ValidationError when 'endDate' is not a string", () => {
      const { next, received } = captureNext();
      assignPolicy(
        buildReq({ policyId: 1, startDate: "2026-01-01", endDate: 12345, priority: 5 }),
        res,
        next
      );
      expect(received()).toBeInstanceOf(ValidationError);
      expect((received() as ValidationError).message).toMatch(/endDate/i);
    });
  });

  describe("'priority' field", () => {
    it("passes a ValidationError when 'priority' is missing", () => {
      const { next, received } = captureNext();
      assignPolicy(
        buildReq({ policyId: 1, startDate: "2026-01-01", endDate: "2026-12-31" }),
        res,
        next
      );
      expect(received()).toBeInstanceOf(ValidationError);
      expect((received() as ValidationError).message).toMatch(/priority/i);
    });

    it("passes a ValidationError when 'priority' is not a number", () => {
      const { next, received } = captureNext();
      assignPolicy(
        buildReq({ policyId: 1, startDate: "2026-01-01", endDate: "2026-12-31", priority: "high" }),
        res,
        next
      );
      expect(received()).toBeInstanceOf(ValidationError);
      expect((received() as ValidationError).message).toMatch(/priority/i);
    });

    it("passes a ValidationError when 'priority' is not a positive integer", () => {
      const { next, received } = captureNext();
      assignPolicy(
        buildReq({ policyId: 1, startDate: "2026-01-01", endDate: "2026-12-31", priority: -1 }),
        res,
        next
      );
      expect(received()).toBeInstanceOf(ValidationError);
      expect((received() as ValidationError).message).toMatch(/priority/i);
    });

    it("passes a ValidationError when 'priority' is not an integer", () => {
      const { next, received } = captureNext();
      assignPolicy(
        buildReq({ policyId: 1, startDate: "2026-01-01", endDate: "2026-12-31", priority: 5.5 }),
        res,
        next
      );
      expect(received()).toBeInstanceOf(ValidationError);
      expect((received() as ValidationError).message).toMatch(/priority/i);
    });
  });
});
