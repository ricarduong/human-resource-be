import { Request, Response, NextFunction } from "express";
import { create } from "../../../../middlewares/employee/create";
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

describe("employee create middleware", () => {
  describe("valid payload", () => {
    it("calls next() with no argument when all required fields are correct", () => {
      const { next, received } = captureNext();
      create(
        buildReq({ name: "Alice", email: "alice@example.com", createdBy: "admin" }),
        res,
        next
      );
      expect(received()).toBeUndefined();
    });

    it("calls next() with no argument when optional 'role' is also provided", () => {
      const { next, received } = captureNext();
      create(
        buildReq({ name: "Bob", email: "bob@corp.io", role: "Manager", createdBy: "admin" }),
        res,
        next
      );
      expect(received()).toBeUndefined();
    });
  });

  describe("'name' field", () => {
    it("passes a ValidationError when 'name' is missing", () => {
      const { next, received } = captureNext();
      create(
        buildReq({ email: "a@b.com", createdBy: "admin" }),
        res,
        next
      );
      expect(received()).toBeInstanceOf(ValidationError);
      expect((received() as ValidationError).message).toMatch(/name/i);
      expect((received() as ValidationError).statusCode).toBe(400);
    });

    it("passes a ValidationError when 'name' is an empty string", () => {
      const { next, received } = captureNext();
      create(
        buildReq({ name: "   ", email: "a@b.com", createdBy: "admin" }),
        res,
        next
      );
      expect(received()).toBeInstanceOf(ValidationError);
      expect((received() as ValidationError).message).toMatch(/name/i);
    });

    it("passes a ValidationError when 'name' is not a string", () => {
      const { next, received } = captureNext();
      create(
        buildReq({ name: 123, email: "a@b.com", createdBy: "admin" }),
        res,
        next
      );
      expect(received()).toBeInstanceOf(ValidationError);
    });
  });

  describe("'email' field", () => {
    it("passes a ValidationError when 'email' is missing", () => {
      const { next, received } = captureNext();
      create(
        buildReq({ name: "Alice", createdBy: "admin" }),
        res,
        next
      );
      expect(received()).toBeInstanceOf(ValidationError);
      expect((received() as ValidationError).message).toMatch(/email/i);
    });

    it("passes a ValidationError when 'email' is an empty string", () => {
      const { next, received } = captureNext();
      create(
        buildReq({ name: "Alice", email: "", createdBy: "admin" }),
        res,
        next
      );
      expect(received()).toBeInstanceOf(ValidationError);
      expect((received() as ValidationError).message).toMatch(/email/i);
    });

    it("passes a ValidationError when 'email' has an invalid format", () => {
      const { next, received } = captureNext();
      create(
        buildReq({ name: "Alice", email: "not-an-email", createdBy: "admin" }),
        res,
        next
      );
      expect(received()).toBeInstanceOf(ValidationError);
      expect((received() as ValidationError).message).toMatch(/valid email/i);
    });

    it("passes a ValidationError when 'email' is missing the domain part", () => {
      const { next, received } = captureNext();
      create(
        buildReq({ name: "Alice", email: "alice@", createdBy: "admin" }),
        res,
        next
      );
      expect(received()).toBeInstanceOf(ValidationError);
    });
  });

  describe("'createdBy' field", () => {
    it("passes a ValidationError when 'createdBy' is missing", () => {
      const { next, received } = captureNext();
      create(
        buildReq({ name: "Alice", email: "alice@example.com" }),
        res,
        next
      );
      expect(received()).toBeInstanceOf(ValidationError);
      expect((received() as ValidationError).message).toMatch(/createdBy/i);
    });

    it("passes a ValidationError when 'createdBy' is an empty string", () => {
      const { next, received } = captureNext();
      create(
        buildReq({ name: "Alice", email: "alice@example.com", createdBy: "" }),
        res,
        next
      );
      expect(received()).toBeInstanceOf(ValidationError);
      expect((received() as ValidationError).message).toMatch(/createdBy/i);
    });
  });

  describe("'role' field (optional)", () => {
    it("passes a ValidationError when 'role' is provided but is an empty string", () => {
      const { next, received } = captureNext();
      create(
        buildReq({ name: "Alice", email: "alice@example.com", role: "  ", createdBy: "admin" }),
        res,
        next
      );
      expect(received()).toBeInstanceOf(ValidationError);
      expect((received() as ValidationError).message).toMatch(/role/i);
    });

    it("passes a ValidationError when 'role' is provided but is not a string", () => {
      const { next, received } = captureNext();
      create(
        buildReq({ name: "Alice", email: "alice@example.com", role: 42, createdBy: "admin" }),
        res,
        next
      );
      expect(received()).toBeInstanceOf(ValidationError);
    });

    it("calls next() with no argument when 'role' is undefined (omitted)", () => {
      const { next, received } = captureNext();
      create(
        buildReq({ name: "Alice", email: "alice@example.com", createdBy: "admin" }),
        res,
        next
      );
      expect(received()).toBeUndefined();
    });
  });
});
