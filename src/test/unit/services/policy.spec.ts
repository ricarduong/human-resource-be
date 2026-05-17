import "reflect-metadata";
import { Status } from "@prisma/client";
import { CreatePolicyDto, PolicyDto } from "../../../dtos/policy.dto";
import { IPolicyValidator } from "../../../interfaces/IPolicyValidator";
import { PolicyService } from "../../../services/PolicyService";
import { IPolicyRepository } from "../../../interfaces/IPolicyRepository";
import { PaginatedResult } from "../../../interfaces/IEmployeeRepository";
import { ConflictError, ValidationError } from "../../../errors/AppError";

const mockPolicy: PolicyDto = {
  id: 1,
  policyName: "Standard Working Hours",
  baseHours: 8,
  coreTimeStart: "09:00",
  coreTimeEnd: "17:00",
  isDefault: true,
  status: Status.ACTIVE,
  createdAt: new Date(),
  createdBy: "admin",
  updatedAt: new Date(),
  updatedBy: "admin",
};

const mockPaginatedResult: PaginatedResult<PolicyDto> = {
  data: [mockPolicy],
  total: 1,
  page: 1,
  limit: 20,
};

const mockCreatePolicyDto: CreatePolicyDto = {
  policyName: "Standard Working Hours",
  baseHours: 8,
  coreTimeStart: "09:00",
  coreTimeEnd: "17:00",
  createdBy: "admin",
  isDefault: true,
  status: Status.ACTIVE,
};

function buildMockRepo(overrides: Partial<IPolicyRepository> = {}): IPolicyRepository {
  return {
    findAll: jest.fn().mockResolvedValue(mockPaginatedResult),
    findByPolicyName: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue(mockPolicy),
    ...overrides,
  };
}

function buildMockValidator(overrides: Partial<IPolicyValidator> = {}): IPolicyValidator {
  return {
    validateCreate: jest.fn(),
    ...overrides,
  };
}

function buildService(repo: IPolicyRepository, validator: IPolicyValidator): PolicyService {
  return new PolicyService(repo, validator);
}

afterEach(() => {
  jest.clearAllMocks();
});

describe("PolicyService.getAllPolicies", () => {
  it("delegates to repository and returns paginated result", async () => {
    const repo = buildMockRepo();
    const validator = buildMockValidator();
    const service = buildService(repo, validator);

    const result = await service.getAllPolicies(1, 20);

    expect(repo.findAll).toHaveBeenCalledWith(1, 20);
    expect(result).toEqual(mockPaginatedResult);
  });

  it("uses provided page and limit", async () => {
    const repo = buildMockRepo();
    const validator = buildMockValidator();
    const service = buildService(repo, validator);

    await service.getAllPolicies(2, 10);

    expect(repo.findAll).toHaveBeenCalledWith(2, 10);
  });

  it("propagates repository errors", async () => {
    const repo = buildMockRepo({
      findAll: jest.fn().mockRejectedValue(new Error("DB error")),
    });
    const validator = buildMockValidator();
    const service = buildService(repo, validator);

    await expect(service.getAllPolicies(1, 20)).rejects.toThrow("DB error");
  });
});

describe("PolicyService.createPolicy", () => {
  it("creates policy when name is unique and payload is valid", async () => {
    const repo = buildMockRepo();
    const validator = buildMockValidator();
    const service = buildService(repo, validator);

    const result = await service.createPolicy(mockCreatePolicyDto);

    expect(validator.validateCreate).toHaveBeenCalledWith(mockCreatePolicyDto);
    expect(repo.findByPolicyName).toHaveBeenCalledWith("Standard Working Hours");
    expect(repo.create).toHaveBeenCalledWith(mockCreatePolicyDto);
    expect(result).toEqual(mockPolicy);
  });

  it("throws ConflictError when policy name already exists", async () => {
    const repo = buildMockRepo({
      findByPolicyName: jest.fn().mockResolvedValue(mockPolicy),
    });
    const validator = buildMockValidator();
    const service = buildService(repo, validator);

    await expect(service.createPolicy(mockCreatePolicyDto)).rejects.toThrow(ConflictError);
    await expect(service.createPolicy(mockCreatePolicyDto)).rejects.toThrow(
      "Policy with name Standard Working Hours already exists"
    );
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("throws ValidationError when base hours is not greater than zero", async () => {
    const repo = buildMockRepo();
    const validator = buildMockValidator({
      validateCreate: jest.fn(() => {
        throw new ValidationError("'baseHours' must be greater than 0");
      }),
    });
    const service = buildService(repo, validator);

    await expect(service.createPolicy({
      ...mockCreatePolicyDto,
      baseHours: 0,
    })).rejects.toThrow(ValidationError);
    expect(repo.findByPolicyName).not.toHaveBeenCalled();
  });

  it("throws ValidationError when core time start is not earlier than core time end", async () => {
    const repo = buildMockRepo();
    const validator = buildMockValidator({
      validateCreate: jest.fn(() => {
        throw new ValidationError("'coreTimeStart' must be earlier than 'coreTimeEnd'");
      }),
    });
    const service = buildService(repo, validator);

    await expect(service.createPolicy({
      ...mockCreatePolicyDto,
      coreTimeStart: "18:00",
      coreTimeEnd: "17:00",
    })).rejects.toThrow(ValidationError);
    expect(repo.findByPolicyName).not.toHaveBeenCalled();
  });

  it("maps Prisma unique errors to ConflictError", async () => {
    const repo = buildMockRepo({
      create: jest.fn().mockRejectedValue({ code: "P2002" }),
    });
    const validator = buildMockValidator();
    const service = buildService(repo, validator);

    await expect(service.createPolicy(mockCreatePolicyDto)).rejects.toThrow(ConflictError);
  });

  it("propagates unexpected repository errors", async () => {
    const repo = buildMockRepo({
      create: jest.fn().mockRejectedValue(new Error("DB error")),
    });
    const validator = buildMockValidator();
    const service = buildService(repo, validator);

    await expect(service.createPolicy(mockCreatePolicyDto)).rejects.toThrow("DB error");
  });
});