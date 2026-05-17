import { Status } from "@prisma/client";

export interface PolicyDto {
  id: number;
  policyName: string;
  baseHours: number;
  coreTimeStart: string;
  coreTimeEnd: string;
  isDefault: boolean;
  status: Status;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date | null;
  updatedBy: string | null;
}