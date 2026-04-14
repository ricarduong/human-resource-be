import { Role } from "@prisma/client";

export interface CreateEmployeeDto {
  email: string;
  name: string;
  role?: Role;
  department: string;
}

export interface UpdateEmployeeDto {
  email?: string;
  name?: string;
  role?: Role;
  department?: string;
}
