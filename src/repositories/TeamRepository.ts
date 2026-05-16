import { inject, injectable } from "inversify";
import { PrismaClient } from "@prisma/client";
import { ITeamRepository } from "../interfaces/ITeamRepository";
import { CreateTeamDto, TeamDto } from "../dtos/team.dto";
import { PaginatedResult } from "../interfaces/IEmployeeRepository";
import { TYPES } from "../constants/types";

@injectable()
export class TeamRepository implements ITeamRepository {
  private prisma: PrismaClient;

  constructor(@inject(TYPES.PrismaClient) prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public async findAll(page: number, limit: number): Promise<PaginatedResult<TeamDto>> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.team.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          code: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.team.count(),
    ]);

    return { data: data as TeamDto[], total, page, limit };
  }

  public async findById(id: number): Promise<TeamDto | null> {
    const team = await this.prisma.team.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return team as TeamDto | null;
  }

  public async findByCode(code: string): Promise<TeamDto | null> {
    const team = await this.prisma.team.findFirst({
      where: { code },
      select: {
        id: true,
        code: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return team as TeamDto | null;
  }

  public async create(data: CreateTeamDto): Promise<TeamDto> {
    const team = await this.prisma.team.create({
      data,
      select: {
        id: true,
        code: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return team as TeamDto;
  }
}
