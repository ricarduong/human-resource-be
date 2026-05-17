import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "../constants/types";
import { EmployeeService } from "../services/EmployeeService";
import { EmployeeRepository } from "../repositories/EmployeeRepository";
import { EmployeeController } from "../controllers/EmployeeController";
import { UserRepository } from "../repositories/UserRepository";
import { UserService } from "../services/UserService";
import { UserController } from "../controllers/UserController";
import { AuthService } from "../services/AuthService";
import { AuthController } from "../controllers/AuthController";
import { TeamRepository } from "../repositories/TeamRepository";
import { TeamService } from "../services/TeamService";
import { TeamController } from "../controllers/TeamController";
import { PolicyRepository } from "../repositories/PolicyRepository";
import { PolicyService } from "../services/PolicyService";
import { PolicyController } from "../controllers/PolicyController";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb(process.env["DATABASE_URL"]!);
const container = new Container();

// Bind instances
container.bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(new PrismaClient({ adapter }));
container.bind(TYPES.EmployeeRepository).to(EmployeeRepository);
container.bind(TYPES.EmployeeService).to(EmployeeService);
container.bind(TYPES.EmployeeController).to(EmployeeController);
container.bind(TYPES.UserRepository).to(UserRepository);
container.bind(TYPES.UserService).to(UserService);
container.bind(TYPES.UserController).to(UserController);
container.bind(TYPES.AuthService).to(AuthService);
container.bind(TYPES.AuthController).to(AuthController);
container.bind(TYPES.TeamRepository).to(TeamRepository);
container.bind(TYPES.TeamService).to(TeamService);
container.bind(TYPES.TeamController).to(TeamController);
container.bind(TYPES.PolicyRepository).to(PolicyRepository);
container.bind(TYPES.PolicyService).to(PolicyService);
container.bind(TYPES.PolicyController).to(PolicyController);

export { container };
