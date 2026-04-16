import { inject, injectable } from "inversify";
import { PrismaClient, User } from "@prisma/client";
import { IUserRepository, CreateUserData } from "../interfaces/IUserRepository";
import { TYPES } from "../constants/types";

@injectable()
export class UserRepository implements IUserRepository {
  private prisma: PrismaClient;

  constructor(@inject(TYPES.PrismaClient) prisma: PrismaClient) {
    this.prisma = prisma;
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
}
