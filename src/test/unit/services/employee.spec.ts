import "reflect-metadata";
import { EmployeeService } from "../../../services/EmployeeService";
import { IEmployeeRepository } from "../../../interfaces/IEmployeeRepository";
import { IPolicyRepository } from "../../../interfaces/IPolicyRepository";
import { Employee, EmployeePolicy, Policy, Role, Status } from "@prisma/client";
import { NotFoundError, ConflictError, ValidationError } from "../../../errors/AppError";
import { AssignPolicyToEmployeeDto } from "../../../dtos/employee.dto";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockEmployee: Employee = {
  id: 1,
  email: "employee@example.com",
  name: "Test Employee",
  role: Role.STAFF,
  createdAt: new Date(),
  createdBy: "admin@example.com",
  updatedAt: new Date(),
  updatedBy: "admin@example.com",
};

const mockPolicy: Policy = {
  id: 1,
  policy_name: "Test Policy",
  base_hours: 8,
  core_time_start: "09:00",
  core_time_end: "17:00",
  is_default: false,
  status: Status.ACTIVE,
  createdAt: new Date(),
  createdBy: "admin@example.com",
  updatedAt: new Date(),
  updatedBy: "admin@example.com",
};

const mockEmployeePolicy: EmployeePolicy = {
  id: 1,
  employeeId: 1,
  policyId: 1,
  startDate: new Date("2026-01-01"),
  endDate: new Date("2026-12-31"),
  priority: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function buildMockEmployeeRepo(overrides: Partial<IEmployeeRepository> = {}): IEmployeeRepository {
  return {
    findAll: jest.fn(),
    findById: jest.fn().mockResolvedValue(mockEmployee),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findPolicyAssignmentWithSamePriority: jest.fn().mockResolvedValue(null),
    findPolicyAssignmentWithNullEndDate: jest.fn().mockResolvedValue(null),
    assignPolicyToEmployee: jest.fn().mockResolvedValue(mockEmployeePolicy),
    ...overrides,
  };
}

function buildMockPolicyRepo(overrides: Partial<IPolicyRepository> = {}): IPolicyRepository {
  return {
    findAll: jest.fn(),
    findById: jest.fn().mockResolvedValue(mockPolicy),
    findByPolicyName: jest.fn(),
    countActivePolicies: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    ...overrides,
  };
}

function buildService(employeeRepo: IEmployeeRepository, policyRepo: IPolicyRepository): EmployeeService {
  return new EmployeeService(employeeRepo, policyRepo);
}

afterEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("EmployeeService.assignPolicyToEmployee", () => {
  const validDto: AssignPolicyToEmployeeDto = {
    policyId: 1,
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-12-31"),
    priority: 5,
  };

  it("successfully assigns policy to employee", async () => {
    const employeeRepo = buildMockEmployeeRepo();
    const policyRepo = buildMockPolicyRepo();
    const service = buildService(employeeRepo, policyRepo);

    const result = await service.assignPolicyToEmployee(1, validDto);

    expect(employeeRepo.findById).toHaveBeenCalledWith(1);
    expect(policyRepo.findById).toHaveBeenCalledWith(1);
    expect(employeeRepo.findPolicyAssignmentWithNullEndDate).not.toHaveBeenCalled();
    expect(employeeRepo.findPolicyAssignmentWithSamePriority).toHaveBeenCalledWith(
      1,
      5,
      validDto.startDate,
      validDto.endDate
    );
    expect(employeeRepo.assignPolicyToEmployee).toHaveBeenCalledWith(1, validDto);
    expect(result).toEqual(mockEmployeePolicy);
  });

  it("throws NotFoundError when employee does not exist", async () => {
    const employeeRepo = buildMockEmployeeRepo({
      findById: jest.fn().mockResolvedValue(null),
    });
    const policyRepo = buildMockPolicyRepo();
    const service = buildService(employeeRepo, policyRepo);

    await expect(service.assignPolicyToEmployee(999, validDto)).rejects.toThrow(NotFoundError);
    await expect(service.assignPolicyToEmployee(999, validDto)).rejects.toThrow(
      "Employee with id 999 not found"
    );
  });

  it("throws NotFoundError when policy does not exist", async () => {
    const employeeRepo = buildMockEmployeeRepo();
    const policyRepo = buildMockPolicyRepo({
      findById: jest.fn().mockResolvedValue(null),
    });
    const service = buildService(employeeRepo, policyRepo);

    await expect(service.assignPolicyToEmployee(1, validDto)).rejects.toThrow(NotFoundError);
    await expect(service.assignPolicyToEmployee(1, validDto)).rejects.toThrow(
      "Policy with id 1 not found"
    );
  });

  it("throws ValidationError when startDate is after or equal to endDate", async () => {
    const employeeRepo = buildMockEmployeeRepo();
    const policyRepo = buildMockPolicyRepo();
    const service = buildService(employeeRepo, policyRepo);

    const invalidDto: AssignPolicyToEmployeeDto = {
      ...validDto,
      startDate: new Date("2026-12-31"),
      endDate: new Date("2026-01-01"),
    };

    await expect(service.assignPolicyToEmployee(1, invalidDto)).rejects.toThrow(ValidationError);
    await expect(service.assignPolicyToEmployee(1, invalidDto)).rejects.toThrow(
      "startDate must be before endDate"
    );
  });

  it("throws ConflictError when employee already has a policy with null endDate", async () => {
    const existingNullEndDatePolicy: EmployeePolicy = {
      ...mockEmployeePolicy,
      endDate: null,
    };
    const employeeRepo = buildMockEmployeeRepo({
      findPolicyAssignmentWithNullEndDate: jest.fn().mockResolvedValue(existingNullEndDatePolicy),
    });
    const policyRepo = buildMockPolicyRepo();
    const service = buildService(employeeRepo, policyRepo);

    const nullEndDateDto: AssignPolicyToEmployeeDto = {
      ...validDto,
      endDate: null,
    };

    await expect(service.assignPolicyToEmployee(1, nullEndDateDto)).rejects.toThrow(ConflictError);
    await expect(service.assignPolicyToEmployee(1, nullEndDateDto)).rejects.toThrow(
      "Employee already has a policy assignment with no end date"
    );
  });

  it("throws ConflictError when employee already has a policy with undefined endDate", async () => {
    const existingNullEndDatePolicy: EmployeePolicy = {
      ...mockEmployeePolicy,
      endDate: null,
    };
    const employeeRepo = buildMockEmployeeRepo({
      findPolicyAssignmentWithNullEndDate: jest.fn().mockResolvedValue(existingNullEndDatePolicy),
    });
    const policyRepo = buildMockPolicyRepo();
    const service = buildService(employeeRepo, policyRepo);

    const undefinedEndDateDto: AssignPolicyToEmployeeDto = {
      policyId: 1,
      startDate: new Date("2026-01-01"),
      endDate: undefined,
      priority: 5,
    };

    await expect(service.assignPolicyToEmployee(1, undefinedEndDateDto)).rejects.toThrow(ConflictError);
    await expect(service.assignPolicyToEmployee(1, undefinedEndDateDto)).rejects.toThrow(
      "Employee already has a policy assignment with no end date"
    );
  });

  it("throws ConflictError when a policy with same priority already exists in overlapping time period", async () => {
    const existingSamePriorityPolicy: EmployeePolicy = {
      ...mockEmployeePolicy,
      priority: 5,
    };
    const employeeRepo = buildMockEmployeeRepo({
      findPolicyAssignmentWithSamePriority: jest.fn().mockResolvedValue(existingSamePriorityPolicy),
    });
    const policyRepo = buildMockPolicyRepo();
    const service = buildService(employeeRepo, policyRepo);

    await expect(service.assignPolicyToEmployee(1, validDto)).rejects.toThrow(ConflictError);
    await expect(service.assignPolicyToEmployee(1, validDto)).rejects.toThrow(
      "Policy with priority 5 is already assigned during the specified time period"
    );
  });

  it("checks for null endDate assignment when endDate is null", async () => {
    const employeeRepo = buildMockEmployeeRepo();
    const policyRepo = buildMockPolicyRepo();
    const service = buildService(employeeRepo, policyRepo);

    const nullEndDateDto: AssignPolicyToEmployeeDto = {
      ...validDto,
      endDate: null,
    };

    await service.assignPolicyToEmployee(1, nullEndDateDto);

    expect(employeeRepo.findPolicyAssignmentWithNullEndDate).toHaveBeenCalledWith(1);
    expect(employeeRepo.findPolicyAssignmentWithSamePriority).toHaveBeenCalledWith(
      1,
      5,
      nullEndDateDto.startDate,
      null
    );
  });

  it("propagates repository errors", async () => {
    const employeeRepo = buildMockEmployeeRepo({
      assignPolicyToEmployee: jest.fn().mockRejectedValue(new Error("DB error")),
    });
    const policyRepo = buildMockPolicyRepo();
    const service = buildService(employeeRepo, policyRepo);

    await expect(service.assignPolicyToEmployee(1, validDto)).rejects.toThrow("DB error");
  });
});
