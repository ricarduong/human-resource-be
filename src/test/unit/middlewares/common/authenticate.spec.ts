import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authenticate } from "../../../../middlewares/common/authenticate";
import { UnauthorizedError } from "../../../../errors/AppError";

function buildReq(headers: Record<string, string> = {}): Request {
  return { headers } as unknown as Request;
}

const res = {} as Response;

function captureNext(): { next: NextFunction; received: () => unknown } {
  let received: unknown;
  const next: NextFunction = (arg?: unknown) => {
    received = arg;
  };
  return { next, received: () => received };
}

const JWT_SECRET = "test-secret";
const validPayload = { sub: 1, email: "user@example.com", role: "STAFF" };

beforeEach(() => {
  process.env["JWT_SECRET"] = JWT_SECRET;
});

afterEach(() => {
  delete process.env["JWT_SECRET"];
});

describe("authenticate middleware", () => {
  describe("missing / malformed Authorization header", () => {
    it("throws UnauthorizedError when Authorization header is absent", () => {
      expect(() => authenticate(buildReq(), res, jest.fn())).toThrow(UnauthorizedError);
    });

    it("throws UnauthorizedError when header does not start with 'Bearer '", () => {
      expect(() =>
        authenticate(buildReq({ authorization: "Token abc" }), res, jest.fn())
      ).toThrow(UnauthorizedError);
    });
  });

  describe("invalid token", () => {
    it("throws UnauthorizedError for a tampered token", () => {
      expect(() =>
        authenticate(buildReq({ authorization: "Bearer invalidtoken" }), res, jest.fn())
      ).toThrow(UnauthorizedError);
    });

    it("throws UnauthorizedError for a token signed with wrong secret", () => {
      const token = jwt.sign(validPayload, "wrong-secret");
      expect(() =>
        authenticate(buildReq({ authorization: `Bearer ${token}` }), res, jest.fn())
      ).toThrow(UnauthorizedError);
    });

    it("throws UnauthorizedError for an expired token", () => {
      const token = jwt.sign(validPayload, JWT_SECRET, { expiresIn: -1 });
      expect(() =>
        authenticate(buildReq({ authorization: `Bearer ${token}` }), res, jest.fn())
      ).toThrow(UnauthorizedError);
    });
  });

  describe("valid token", () => {
    it("calls next() with no argument and sets req.user", () => {
      const token = jwt.sign(validPayload, JWT_SECRET);
      const req = buildReq({ authorization: `Bearer ${token}` });
      const { next, received } = captureNext();

      authenticate(req, res, next);

      expect(received()).toBeUndefined();
      expect(req.user).toMatchObject({ sub: 1, email: "user@example.com", role: "STAFF" });
    });
  });
});
