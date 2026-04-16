import { AuthResponseDto, GoogleAuthDto } from "../dtos/auth.dto";

export interface IAuthService {
  googleLogin(dto: GoogleAuthDto): Promise<AuthResponseDto>;
}
