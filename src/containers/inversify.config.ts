import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "../constants/types";
import { EmployeeService } from "../services/EmployeeService";
import { EmployeeRepository } from "../repositories/EmployeeRepository";
import { EmployeeController } from "../controllers/EmployeeController";
import { PrismaClient } from "@prisma/client";

const container = new Container();

// Bind instances
container.bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(new PrismaClient());
container.bind(TYPES.EmployeeRepository).to(EmployeeRepository);
container.bind(TYPES.EmployeeService).to(EmployeeService);
container.bind(TYPES.EmployeeController).to(EmployeeController);

export { container };
