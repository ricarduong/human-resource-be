import "reflect-metadata";
import { AuthService } from "../../../services/AuthService";
import { IUserRepository } from "../../../interfaces/IUserRepository";
import { UnauthorizedError } from "../../../errors/AppError";
import { Role } from "@prisma/client";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockVerifyIdToken = jest.fn();

jest.mock("google-auth-library", () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: mockVerifyIdToken,
  })),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mocked.jwt.token"),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockUser = {
  id: 1,
  googleId: "google-sub-123",
  email: "user@example.com",
  name: "Test User",
  role: "STAFF" as Role,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function buildMockRepo(overrides: Partial<IUserRepository> = {}): IUserRepository {
  return {
    findAll: jest.fn(),
    findByEmailSafe: jest.fn().mockResolvedValue(null),
    findByGoogleId: jest.fn().mockResolvedValue(null),
    findByEmail: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn(),
    delete: jest.fn(),
    ...overrides,
  };
}

function buildService(repo: IUserRepository): AuthService {
  const service = new AuthService(repo);
  return service;
}

beforeEach(() => {
  process.env["JWT_SECRET"] = "test-secret";
  process.env["JWT_EXPIRES_IN"] = "7d";
  process.env["GOOGLE_CLIENT_ID"] = "test-client-id";
});

afterEach(() => {
  jest.clearAllMocks();
  delete process.env["JWT_SECRET"];
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AuthService.googleLogin", () => {
  describe("invalid Google token", () => {
    it("throws UnauthorizedError when verifyIdToken rejects", async () => {
      mockVerifyIdToken.mockRejectedValueOnce(new Error("invalid token"));
      const service = buildService(buildMockRepo());

      await expect(service.googleLogin({ idToken: "bad-token" })).rejects.toThrow(
        UnauthorizedError
      );
    });

    it("throws UnauthorizedError when payload is missing required fields", async () => {
      mockVerifyIdToken.mockResolvedValueOnce({
        getPayload: () => ({ sub: null, email: null, name: null }),
      });
      const service = buildService(buildMockRepo());

      await expect(service.googleLogin({ idToken: "token" })).rejects.toThrow(UnauthorizedError);
    });
  });

  describe("new user (first login)", () => {
    it("creates a new user and returns accessToken + user", async () => {
      mockVerifyIdToken.mockResolvedValueOnce({
        getPayload: () => ({
          sub: "google-sub-123",
          email: "user@example.com",
          name: "Test User",
        }),
      });
      const repo = buildMockRepo({ findByGoogleId: jest.fn().mockResolvedValue(null) });
      const service = buildService(repo);

      const result = await service.googleLogin({ idToken: "valid-token" });

      expect(repo.create).toHaveBeenCalledWith({
        googleId: "google-sub-123",
        email: "user@example.com",
        name: "Test User",
        createdBy: 'system'
      });
      expect(result.accessToken).toBe("mocked.jwt.token");
      expect(result.user).toMatchObject({
        id: 1,
        email: "user@example.com",
        name: "Test User",
        role: "STAFF",
      });
    });
  });

  describe("existing user (subsequent login)", () => {
    it("returns accessToken without creating a new user", async () => {
      mockVerifyIdToken.mockResolvedValueOnce({
        getPayload: () => ({
          sub: "google-sub-123",
          email: "user@example.com",
          name: "Test User",
        }),
      });
      const repo = buildMockRepo({
        findByGoogleId: jest.fn().mockResolvedValue(mockUser),
      });
      const service = buildService(repo);

      const result = await service.googleLogin({ idToken: "valid-token" });

      expect(repo.create).not.toHaveBeenCalled();
      expect(result.accessToken).toBe("mocked.jwt.token");
      expect(result.user.id).toBe(1);
    });
  });
});
