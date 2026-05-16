import "reflect-metadata";
import { TeamService } from "../../../services/TeamService";
import { ITeamRepository } from "../../../interfaces/ITeamRepository";
import { PaginatedResult } from "../../../interfaces/IEmployeeRepository";
import { CreateTeamDto, TeamDto } from "../../../dtos/team.dto";
import { ConflictError, NotFoundError } from "../../../errors/AppError";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockTeam: TeamDto = {
  id: 1,
  code: "TEAM-001",
  name: "Engineering",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPaginatedResult: PaginatedResult<TeamDto> = {
  data: [mockTeam],
  total: 1,
  page: 1,
  limit: 20,
};

const mockCreateTeamDto: CreateTeamDto = {
  code: "TEAM-001",
  name: "Engineering",
};

function buildMockRepo(overrides: Partial<ITeamRepository> = {}): ITeamRepository {
  return {
    findAll: jest.fn().mockResolvedValue(mockPaginatedResult),
    findById: jest.fn().mockResolvedValue(mockTeam),
    findByCode: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue(mockTeam),
    ...overrides,
  };
}

function buildService(repo: ITeamRepository): TeamService {
  return new TeamService(repo);
}

afterEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("TeamService.getAllTeams", () => {
  it("delegates to repository and returns paginated result", async () => {
    const repo = buildMockRepo();
    const service = buildService(repo);

    const result = await service.getAllTeams(1, 20);

    expect(repo.findAll).toHaveBeenCalledWith(1, 20);
    expect(result).toEqual(mockPaginatedResult);
  });

  it("uses provided page and limit", async () => {
    const repo = buildMockRepo();
    const service = buildService(repo);

    await service.getAllTeams(2, 10);

    expect(repo.findAll).toHaveBeenCalledWith(2, 10);
  });

  it("propagates repository errors", async () => {
    const repo = buildMockRepo({
      findAll: jest.fn().mockRejectedValue(new Error("DB error")),
    });
    const service = buildService(repo);

    await expect(service.getAllTeams(1, 20)).rejects.toThrow("DB error");
  });
});

describe("TeamService.getTeamById", () => {
  it("returns team when found", async () => {
    const repo = buildMockRepo();
    const service = buildService(repo);

    const result = await service.getTeamById(1);

    expect(repo.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockTeam);
  });

  it("throws NotFoundError when team does not exist", async () => {
    const repo = buildMockRepo({
      findById: jest.fn().mockResolvedValue(null),
    });
    const service = buildService(repo);

    await expect(service.getTeamById(99)).rejects.toThrow(NotFoundError);
    await expect(service.getTeamById(99)).rejects.toThrow("Team with id 99 not found");
  });

  it("propagates repository errors", async () => {
    const repo = buildMockRepo({
      findById: jest.fn().mockRejectedValue(new Error("DB error")),
    });
    const service = buildService(repo);

    await expect(service.getTeamById(1)).rejects.toThrow("DB error");
  });
});

describe("TeamService.createTeam", () => {
  it("creates team when code is unique", async () => {
    const repo = buildMockRepo();
    const service = buildService(repo);

    const result = await service.createTeam(mockCreateTeamDto);

    expect(repo.findByCode).toHaveBeenCalledWith("TEAM-001");
    expect(repo.create).toHaveBeenCalledWith(mockCreateTeamDto);
    expect(result).toEqual(mockTeam);
  });

  it("throws ConflictError when code already exists", async () => {
    const repo = buildMockRepo({
      findByCode: jest.fn().mockResolvedValue(mockTeam),
    });
    const service = buildService(repo);

    await expect(service.createTeam(mockCreateTeamDto)).rejects.toThrow(ConflictError);
    await expect(service.createTeam(mockCreateTeamDto)).rejects.toThrow(
      "Team with code TEAM-001 already exists"
    );
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("maps Prisma unique errors to ConflictError", async () => {
    const repo = buildMockRepo({
      create: jest.fn().mockRejectedValue({ code: "P2002" }),
    });
    const service = buildService(repo);

    await expect(service.createTeam(mockCreateTeamDto)).rejects.toThrow(ConflictError);
  });

  it("propagates unexpected repository errors", async () => {
    const repo = buildMockRepo({
      create: jest.fn().mockRejectedValue(new Error("DB error")),
    });
    const service = buildService(repo);

    await expect(service.createTeam(mockCreateTeamDto)).rejects.toThrow("DB error");
  });
});
