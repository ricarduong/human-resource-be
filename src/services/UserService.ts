import { injectable, inject } from "inversify";
import { IUserService } from "../interfaces/IUserService";
import { IUserRepository, UpdateUserData } from "../interfaces/IUserRepository";
import { PaginatedResult } from "../interfaces/IEmployeeRepository";
import { SafeUser } from "../dtos/user.dto";
import { TYPES } from "../constants/types";
import { Logger } from "../utils/Logger";
import { NotFoundError } from "../errors/AppError";

const logger = new Logger("UserService");

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository
  ) {}

  async getAllUsers(page: number, limit: number): Promise<PaginatedResult<SafeUser>> {
    logger.info("Fetching all users", { page, limit });
    try {
      const result = await this.userRepository.findAll(page, limit);
      logger.info("Fetched all users", { count: result.data.length, total: result.total });
      return result;
    } catch (error) {
      logger.error("Failed to fetch users", error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<SafeUser> {
    logger.info("Fetching user by email", { email });
    try {
      const user = await this.userRepository.findByEmailSafe(email);
      if (!user) {
        throw new NotFoundError(`User with email ${email} not found`);
      }
      logger.info("Fetched user by email", { email });
      return user;
    } catch (error) {
      logger.error("Failed to fetch user by email", error);
      throw error;
    }
  }

  async updateUser(id: number, data: UpdateUserData): Promise<SafeUser> {
    logger.info("Updating user", { id });
    try {
      const updated = await this.userRepository.update(id, data);
      logger.info("Updated user", { id });
      return updated;
    } catch (error: unknown) {
      const prismaError = error as { code?: string };
      if (prismaError?.code === "P2025") {
        throw new NotFoundError(`User with id ${id} not found`);
      }
      logger.error("Failed to update user", error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    logger.info("Deleting user", { id });
    try {
      await this.userRepository.delete(id);
      logger.info("Deleted user", { id });
    } catch (error: unknown) {
      const prismaError = error as { code?: string };
      if (prismaError?.code === "P2025") {
        throw new NotFoundError(`User with id ${id} not found`);
      }
      logger.error("Failed to delete user", error);
      throw error;
    }
  }
}
