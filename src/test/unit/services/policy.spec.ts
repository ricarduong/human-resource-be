import "reflect-metadata";
import { Status } from "@prisma/client";
import { CreatePolicyDto, PolicyDto, UpdatePolicyDto } from "../../../dtos/policy.dto";
import { IPolicyValidator } from "../../../interfaces/IPolicyValidator";
import { PolicyService } from "../../../services/PolicyService";
import { IPolicyRepository } from "../../../interfaces/IPolicyRepository";
import { PaginatedResult } from "../../../interfaces/IEmployeeRepository";
import { ConflictError, NotFoundError, ValidationError } from "../../../errors/AppError";

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

const mockUpdatePolicyDto: UpdatePolicyDto = {
  policyName: "Flexible Working Hours",
  baseHours: 7.5,
  coreTimeStart: "10:00",
  coreTimeEnd: "17:30",
  updatedBy: "manager",
  isDefault: false,
  status: Status.INACTIVE,
};

const mockUpdatedPolicy: PolicyDto = {
  ...mockPolicy,
  policyName: "Flexible Working Hours",
  baseHours: 7.5,
  coreTimeStart: "10:00",
  coreTimeEnd: "17:30",
  isDefault: false,
  status: Status.INACTIVE,
  updatedBy: "manager",
};

function buildMockRepo(overrides: Partial<IPolicyRepository> = {}): IPolicyRepository {
  return {
    findAll: jest.fn().mockResolvedValue(mockPaginatedResult),
    findById: jest.fn().mockResolvedValue(mockPolicy),
    findByPolicyName: jest.fn().mockResolvedValue(null),
    countActivePolicies: jest.fn().mockResolvedValue(2),
    create: jest.fn().mockResolvedValue(mockPolicy),
    update: jest.fn().mockResolvedValue(mockUpdatedPolicy),
    ...overrides,
  };
}

function buildMockValidator(overrides: Partial<IPolicyValidator> = {}): IPolicyValidator {
  return {
    validateCreate: jest.fn(),
    validateUpdate: jest.fn(),
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

describe("PolicyService.updatePolicy", () => {
  it("updates policy when payload is valid and name remains unique", async () => {
    const repo = buildMockRepo({
      findById: jest.fn().mockResolvedValue({
        ...mockPolicy,
        isDefault: false,
      }),
    });
    const validator = buildMockValidator();
    const service = buildService(repo, validator);

    const result = await service.updatePolicy(1, mockUpdatePolicyDto);

    expect(validator.validateUpdate).toHaveBeenCalledWith(mockUpdatePolicyDto);
    expect(repo.findById).toHaveBeenCalledWith(1);
    expect(validator.validateCreate).toHaveBeenCalledWith({
      policyName: "Flexible Working Hours",
      baseHours: 7.5,
      coreTimeStart: "10:00",
      coreTimeEnd: "17:30",
      createdBy: "admin",
      isDefault: false,
      status: Status.INACTIVE,
    });
    expect(repo.findByPolicyName).toHaveBeenCalledWith("Flexible Working Hours");
    expect(repo.update).toHaveBeenCalledWith(1, mockUpdatePolicyDto);
    expect(result).toEqual(mockUpdatedPolicy);
  });

  it("uses existing values to validate partial time updates", async () => {
    const repo = buildMockRepo();
    const validator = buildMockValidator();
    const service = buildService(repo, validator);

    await service.updatePolicy(1, {
      coreTimeStart: "08:30",
      updatedBy: "manager",
    });

    expect(validator.validateCreate).toHaveBeenCalledWith({
      policyName: "Standard Working Hours",
      baseHours: 8,
      coreTimeStart: "08:30",
      coreTimeEnd: "17:00",
      createdBy: "admin",
      isDefault: true,
      status: Status.ACTIVE,
    });
  });

  it("throws NotFoundError when policy does not exist", async () => {
    const repo = buildMockRepo({
      findById: jest.fn().mockResolvedValue(null),
    });
    const validator = buildMockValidator();
    const service = buildService(repo, validator);

    await expect(service.updatePolicy(999, mockUpdatePolicyDto)).rejects.toThrow(NotFoundError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("throws ConflictError when updated name already belongs to another policy", async () => {
    const repo = buildMockRepo({
      findById: jest.fn().mockResolvedValue({
        ...mockPolicy,
        isDefault: false,
      }),
      findByPolicyName: jest.fn().mockResolvedValue({
        ...mockPolicy,
        id: 2,
        policyName: "Flexible Working Hours",
      }),
    });
    const validator = buildMockValidator();
    const service = buildService(repo, validator);

    await expect(service.updatePolicy(1, mockUpdatePolicyDto)).rejects.toThrow(ConflictError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("throws ValidationError when changing status of a default policy", async () => {
    const repo = buildMockRepo();
    const validator = buildMockValidator();
    const service = buildService(repo, validator);

    await expect(service.updatePolicy(1, {
      updatedBy: "manager",
      status: Status.INACTIVE,
    })).rejects.toThrow(new ValidationError("Default policy status cannot be changed"));
    expect(repo.countActivePolicies).not.toHaveBeenCalled();
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("throws ValidationError when inactivating the last active policy", async () => {
    const repo = buildMockRepo({
      findById: jest.fn().mockResolvedValue({
        ...mockPolicy,
        isDefault: false,
      }),
      countActivePolicies: jest.fn().mockResolvedValue(1),
    });
    const validator = buildMockValidator();
    const service = buildService(repo, validator);

    await expect(service.updatePolicy(1, {
      updatedBy: "manager",
      status: Status.INACTIVE,
    })).rejects.toThrow(new ValidationError("At least one active policy must remain"));
    expect(repo.countActivePolicies).toHaveBeenCalledTimes(1);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("does not throw conflict when keeping the same name on the same policy", async () => {
    const repo = buildMockRepo({
      findByPolicyName: jest.fn().mockResolvedValue(mockPolicy),
    });
    const validator = buildMockValidator();
    const service = buildService(repo, validator);

    await expect(service.updatePolicy(1, {
      policyName: "Standard Working Hours",
      updatedBy: "manager",
    })).resolves.toEqual(mockUpdatedPolicy);
  });

  it("propagates validation errors from update validator", async () => {
    const repo = buildMockRepo();
    const validator = buildMockValidator({
      validateUpdate: jest.fn(() => {
        throw new ValidationError("'baseHours' must be greater than 0");
      }),
    });
    const service = buildService(repo, validator);

    await expect(service.updatePolicy(1, {
      updatedBy: "manager",
      baseHours: 0,
    })).rejects.toThrow(ValidationError);
    expect(repo.findById).not.toHaveBeenCalled();
  });

  it("maps Prisma unique errors to ConflictError", async () => {
    const repo = buildMockRepo({
      findById: jest.fn().mockResolvedValue({
        ...mockPolicy,
        isDefault: false,
      }),
      update: jest.fn().mockRejectedValue({ code: "P2002" }),
    });
    const validator = buildMockValidator();
    const service = buildService(repo, validator);

    await expect(service.updatePolicy(1, mockUpdatePolicyDto)).rejects.toThrow(ConflictError);
  });

  it("maps Prisma missing record errors to NotFoundError", async () => {
    const repo = buildMockRepo({
      findById: jest.fn().mockResolvedValue({
        ...mockPolicy,
        isDefault: false,
      }),
      update: jest.fn().mockRejectedValue({ code: "P2025" }),
    });
    const validator = buildMockValidator();
    const service = buildService(repo, validator);

    await expect(service.updatePolicy(1, mockUpdatePolicyDto)).rejects.toThrow(NotFoundError);
  });
});