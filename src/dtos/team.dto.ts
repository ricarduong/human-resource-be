import { Team } from "@prisma/client";

export interface CreateTeamDto {
	code: string;
	name: string;
}

export type TeamDto = Pick<Team, "id" | "code" | "name" | "createdAt" | "updatedAt">;
