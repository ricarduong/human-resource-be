import { Role } from "@prisma/client";

export interface GoogleAuthDto {
  idToken: string;
}

export interface AuthUserDto {
  id: number;
  email: string;
  name: string;
  role: Role;
}

export interface AuthResponseDto {
  accessToken: string;
  user: AuthUserDto;
}
