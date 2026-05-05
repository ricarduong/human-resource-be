import "reflect-metadata";
import { UserService } from "../../../services/UserService";
import { IUserRepository } from "../../../interfaces/IUserRepository";
import { PaginatedResult } from "../../../interfaces/IEmployeeRepository";
import { SafeUser } from "../../../dtos/user.dto";
import { NotFoundError } from "../../../errors/AppError";
import { Role } from "@prisma/client";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockSafeUser: SafeUser = {
  id: 1,
  email: "user@example.com",
  name: "Test User",
  role: "STAFF" as Role,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPaginatedResult: PaginatedResult<SafeUser> = {
  data: [mockSafeUser],
  total: 1,
  page: 1,
  limit: 20,
};

function buildMockRepo(overrides: Partial<IUserRepository> = {}): IUserRepository {
  return {
    findAll: jest.fn().mockResolvedValue(mockPaginatedResult),
    findByEmailSafe: jest.fn().mockResolvedValue(mockSafeUser),
    findByGoogleId: jest.fn().mockResolvedValue(null),
    findByEmail: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    update: jest.fn().mockResolvedValue(mockSafeUser),
    delete: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function buildService(repo: IUserRepository): UserService {
  return new UserService(repo);
}

afterEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("UserService.getAllUsers", () => {
  it("delegates to repository and returns paginated result", async () => {
    const repo = buildMockRepo();
    const service = buildService(repo);

    const result = await service.getAllUsers(1, 20);

    expect(repo.findAll).toHaveBeenCalledWith(1, 20);
    expect(result).toEqual(mockPaginatedResult);
  });

  it("propagates repository errors", async () => {
    const repo = buildMockRepo({
      findAll: jest.fn().mockRejectedValue(new Error("DB error")),
    });
    const service = buildService(repo);

    await expect(service.getAllUsers(1, 20)).rejects.toThrow("DB error");
  });
});

describe("UserService.getUserByEmail", () => {
  it("returns user when found", async () => {
    const repo = buildMockRepo();
    const service = buildService(repo);

    const result = await service.getUserByEmail("user@example.com");

    expect(repo.findByEmailSafe).toHaveBeenCalledWith("user@example.com");
    expect(result).toEqual(mockSafeUser);
  });

  it("throws NotFoundError when user does not exist", async () => {
    const repo = buildMockRepo({
      findByEmailSafe: jest.fn().mockResolvedValue(null),
    });
    const service = buildService(repo);

    await expect(service.getUserByEmail("notfound@example.com")).rejects.toThrow(NotFoundError);
    await expect(service.getUserByEmail("notfound@example.com")).rejects.toThrow(
      "User with email notfound@example.com not found"
    );
  });

  it("propagates repository errors", async () => {
    const repo = buildMockRepo({
      findByEmailSafe: jest.fn().mockRejectedValue(new Error("DB error")),
    });
    const service = buildService(repo);

    await expect(service.getUserByEmail("user@example.com")).rejects.toThrow("DB error");
  });
});

describe("UserService.updateUser", () => {
  it("delegates to repository and returns updated user", async () => {
    const updatedUser: SafeUser = { ...mockSafeUser, name: "Updated Name" };
    const repo = buildMockRepo({
      update: jest.fn().mockResolvedValue(updatedUser),
    });
    const service = buildService(repo);

    const result = await service.updateUser(1, { name: "Updated Name" });

    expect(repo.update).toHaveBeenCalledWith(1, { name: "Updated Name" });
    expect(result).toEqual(updatedUser);
  });

  it("throws NotFoundError when Prisma returns P2025", async () => {
    const prismaNotFound = Object.assign(new Error("Record not found"), { code: "P2025" });
    const repo = buildMockRepo({
      update: jest.fn().mockRejectedValue(prismaNotFound),
    });
    const service = buildService(repo);

    await expect(service.updateUser(99, { name: "X" })).rejects.toThrow(NotFoundError);
    await expect(service.updateUser(99, { name: "X" })).rejects.toThrow(
      "User with id 99 not found"
    );
  });

  it("propagates non-P2025 repository errors", async () => {
    const repo = buildMockRepo({
      update: jest.fn().mockRejectedValue(new Error("DB error")),
    });
    const service = buildService(repo);

    await expect(service.updateUser(1, { name: "X" })).rejects.toThrow("DB error");
  });
});

describe("UserService.deleteUser", () => {
  it("delegates to repository and resolves without a value", async () => {
    const repo = buildMockRepo();
    const service = buildService(repo);

    await expect(service.deleteUser(1)).resolves.toBeUndefined();
    expect(repo.delete).toHaveBeenCalledWith(1);
  });

  it("throws NotFoundError when Prisma returns P2025", async () => {
    const prismaNotFound = Object.assign(new Error("Record not found"), { code: "P2025" });
    const repo = buildMockRepo({
      delete: jest.fn().mockRejectedValue(prismaNotFound),
    });
    const service = buildService(repo);

    await expect(service.deleteUser(99)).rejects.toThrow(NotFoundError);
    await expect(service.deleteUser(99)).rejects.toThrow("User with id 99 not found");
  });

  it("propagates non-P2025 repository errors", async () => {
    const repo = buildMockRepo({
      delete: jest.fn().mockRejectedValue(new Error("DB error")),
    });
    const service = buildService(repo);

    await expect(service.deleteUser(1)).rejects.toThrow("DB error");
  });
});
