import { User, Role } from "@prisma/client";
import { PaginatedResult } from "./IEmployeeRepository";
import { SafeUser } from "../dtos/user.dto";

export interface CreateUserData {
  googleId: string;
  email: string;
  name: string;
}

export interface UpdateUserData {
  name?: string;
  role?: Role;
}

export interface IUserRepository {
  findAll(page: number, limit: number): Promise<PaginatedResult<SafeUser>>;
  findByEmailSafe(email: string): Promise<SafeUser | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  update(id: number, data: UpdateUserData): Promise<SafeUser>;
  delete(id: number): Promise<void>;
}
