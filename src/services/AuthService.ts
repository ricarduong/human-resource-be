import { injectable, inject } from "inversify";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { IAuthService } from "../interfaces/IAuthService";
import { IUserRepository } from "../interfaces/IUserRepository";
import { GoogleAuthDto, AuthResponseDto } from "../dtos/auth.dto";
import { TYPES } from "../constants/types";
import { UnauthorizedError } from "../errors/AppError";
import { Logger } from "../utils/Logger";

const logger = new Logger("AuthService");

@injectable()
export class AuthService implements IAuthService {
  private googleClient: OAuth2Client;

  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository
  ) {
    this.googleClient = new OAuth2Client(process.env["GOOGLE_CLIENT_ID"]);
  }

  async googleLogin(dto: GoogleAuthDto): Promise<AuthResponseDto> {
    logger.info("Verifying Google ID token");

    const ticket = await this.googleClient.verifyIdToken({
      idToken: dto.idToken,
      audience: process.env["GOOGLE_CLIENT_ID"],
    }).catch(() => {
      throw new UnauthorizedError("Invalid Google ID token");
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email || !payload.name) {
      throw new UnauthorizedError("Incomplete Google token payload");
    }

    let user = await this.userRepository.findByGoogleId(payload.sub);

    if (!user) {
      logger.info("Creating new user from Google login", { email: payload.email });
      user = await this.userRepository.create({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        createdBy: 'system'
      });
    }

    const jwtSecret = process.env["JWT_SECRET"];
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: (process.env["JWT_EXPIRES_IN"] ?? "7d") as jwt.SignOptions["expiresIn"] }
    );

    logger.info("Google login successful", { userId: user.id });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
