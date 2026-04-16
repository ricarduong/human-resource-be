import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "../constants/types";
import { EmployeeService } from "../services/EmployeeService";
import { EmployeeRepository } from "../repositories/EmployeeRepository";
import { EmployeeController } from "../controllers/EmployeeController";
import { UserRepository } from "../repositories/UserRepository";
import { AuthService } from "../services/AuthService";
import { AuthController } from "../controllers/AuthController";
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
container.bind(TYPES.AuthService).to(AuthService);
container.bind(TYPES.AuthController).to(AuthController);

export { container };
