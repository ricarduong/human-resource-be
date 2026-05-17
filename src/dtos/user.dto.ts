import { User, Role } from "@prisma/client";

export type SafeUser = Omit<User, "googleId">;

export interface UpdateUserDto {
  name?: string;
  role?: Role;
}
