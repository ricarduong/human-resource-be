import { User } from "@prisma/client";

export interface CreateUserData {
  googleId: string;
  email: string;
  name: string;
}

export interface IUserRepository {
  findByGoogleId(googleId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
}
