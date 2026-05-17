import { Status } from "@prisma/client";

export interface CreatePolicyDto {
  policyName: string;
  baseHours: number;
  coreTimeStart: string;
  coreTimeEnd: string;
  createdBy: string;
  isDefault?: boolean;
  status?: Status;
}

export interface UpdatePolicyDto {
  policyName?: string;
  baseHours?: number;
  coreTimeStart?: string;
  coreTimeEnd?: string;
  updatedBy: string;
  isDefault?: boolean;
  status?: Status;
}

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