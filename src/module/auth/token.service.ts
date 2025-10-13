import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { jwtConfig } from 'app/config';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface IUSER {
  id: string;
  email: string;
  username: string;
  role: string;
  status: string;
}

@Injectable()
export class TokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor(
    @Inject('jwt') private readonly jwtCfg: ConfigType<typeof jwtConfig>,
  ) {
    this.accessSecret = this.jwtCfg.accessSecret;
    this.refreshSecret = this.jwtCfg.refreshSecret;
    this.accessExpiresIn = this.jwtCfg.accessExpiresIn;
    this.refreshExpiresIn = this.jwtCfg.refreshExpiresIn;
  }

  generateTokenPair(payload: IUSER) {
    const access_token = (jwt.sign as any)(payload, this.accessSecret, {
      expiresIn: this.accessExpiresIn,
    });

    const refresh_token = (jwt.sign as any)(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn,
    });
    return { access_token, refresh_token };
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.accessSecret);
      if (typeof decoded === 'string') {
        throw new UnauthorizedException('Invalid or expired access token.');
      }
      return decoded;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token.');
    }
  }

  verifyRefreshToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.refreshSecret);
      if (typeof decoded === 'string') {
        throw new UnauthorizedException('Invalid or expired refresh token.');
      }
      return decoded;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }
}
