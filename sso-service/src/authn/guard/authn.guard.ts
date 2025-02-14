import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigKeys } from '../../common/constants/config-keys';
import { ErrorMessages } from '../../common/constants/error-messages';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthnGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private reflector: Reflector,
    private prismaService: PrismaService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    // Exclude API login and registration information from request token
    if (
      url.includes('/authn/login') ||
      url.includes('/authn/register') ||
      url.includes('/authn/logout')||
      url.includes('/authn/google')
    ) {
      return true;
    }

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(ErrorMessages.TOKEN_NOT_FOUND);
    }

    try {
      const secret = this.config.get(ConfigKeys.JWT_SECRET);
      const payload = await this.jwtService.verifyAsync(token, { secret });

      // Check if token exists in the database
      const userToken = await this.prismaService.user_token.findFirst({
        where: {
          user_id: payload.sub,
          token: token,
        },
      });

      if (!userToken) {
        throw new UnauthorizedException(ErrorMessages.TOKEN_NOT_FOUND);
      }

      request.user = { id: payload.sub, email: payload.email };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(ErrorMessages.TOKEN_HAS_EXPIRED);
      }
      throw new UnauthorizedException(ErrorMessages.INVALID_TOKEN);
    }

    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.config.get(ConfigKeys.JWT_SECRET),
      });
      request.user = decoded;

      return true;
    } catch (error) {
      throw new UnauthorizedException(ErrorMessages.INVALID_TOKEN);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return undefined;
    }
    return authHeader.split(' ')[1];
  }
}
