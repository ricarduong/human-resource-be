import { PaginatedResult } from "./IEmployeeRepository";
import { SafeUser } from "../dtos/user.dto";
import { UpdateUserData } from "./IUserRepository";

export interface IUserService {
  getAllUsers(page: number, limit: number): Promise<PaginatedResult<SafeUser>>;
  getUserByEmail(email: string): Promise<SafeUser>;
  updateUser(id: number, data: UpdateUserData): Promise<SafeUser>;
  deleteUser(id: number): Promise<void>;
}
