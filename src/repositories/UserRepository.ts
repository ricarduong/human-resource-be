import { inject, injectable } from "inversify";
import { PrismaClient, User } from "@prisma/client";
import { IUserRepository, CreateUserData, UpdateUserData } from "../interfaces/IUserRepository";
import { PaginatedResult } from "../interfaces/IEmployeeRepository";
import { SafeUser } from "../dtos/user.dto";
import { TYPES } from "../constants/types";

@injectable()
export class UserRepository implements IUserRepository {
  private prisma: PrismaClient;

  constructor(@inject(TYPES.PrismaClient) prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public async findAll(page: number, limit: number): Promise<PaginatedResult<SafeUser>> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    return { data: data as SafeUser[], total, page, limit };
  }

  public async findByEmailSafe(email: string): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as Promise<SafeUser | null>;
  }

  public async findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { googleId } });
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  public async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({ data });
  }

  public async update(id: number, data: UpdateUserData): Promise<SafeUser> {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as Promise<SafeUser>;
  }

  public async delete(id: number): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
