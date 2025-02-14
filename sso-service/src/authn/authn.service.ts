import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { LoginType } from "@prisma/client";
import * as bcrypt from 'bcrypt';
import { ConfigKeys } from "../common/constants/config-keys";
import { ErrorMessages } from "../common/constants/error-messages";
import { hashPassword } from "../common/util";
import { PrismaService } from "../prisma/prisma.service";
import { AdminRequest } from "./request/admin.requets";
import { RegisterRequest } from "./request/register.request";

@Injectable({})
export class AuthnService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) { }

  /**
   * Registers a new user.
   * @param registerReq.
   * @returns - The newly created user with email, first name, and last name.
   * @throws BadRequestException - If a user with the provided email already exists.
   */
  async register(registerReq: RegisterRequest) {
    // Check if user already exists
    const existingUser = await this.prismaService.users.findUnique({
      where: { email: registerReq.email },
    });
    if (existingUser) {
      throw new BadRequestException(ErrorMessages.EMAIL_ALREADY_REGISTERED);
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(registerReq.password);
    return await this.prismaService.users.create({
      data: {
        email: registerReq.email,
        password: hashedPassword,
        first_name: registerReq.firstName,
        last_name: registerReq.lastName,
      },
      select: { email: true, first_name: true, last_name: true },
    });
  }

  /**
   * Logs in a user and generates an access token.
   * @param adminReq.
   * @returns - An object containing user details, access token, and permissions.
   * @throws NotFoundException - If the user with the provided email is not found.
   * @throws UnauthorizedException - If the provided password is incorrect.
   */
  async login(adminReq: AdminRequest) {
    // check user exist
    const userExist = await this.prismaService.users.findUnique({
      where: {
        email: adminReq.email,
        has_deleted: false
      },
    });
    if (!userExist) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    // compare user password
    const isPasswordValid = await bcrypt.compare(adminReq.password, userExist.password);
    if (!isPasswordValid) {
      throw new ForbiddenException(ErrorMessages.PASSWORD_INVALID);
    }

    // Remove expired tokens
    await this.removeExpiredTokens(userExist.id);

    // generate token
    const { id, email } = userExist;
    const accessToken = await this.signToken(id, email);

    // Save token to user_token table
    await this.saveTokenToDatabase(id, accessToken, LoginType.LOCAL);

    return {
      id: userExist.id,
      email: userExist.email,
      firstName: userExist.first_name,
      lastName: userExist.last_name,
      accessToken
    };
  }

  /**
   * Logs out a user by removing the specified token.
   * @param userId - The ID of the user.
   * @param token - The token to be removed.
   * @returns - An empty object if successful.
   * @throws NotFoundException - If the token is not found in the database.
   */
  async logout(userId: string, token: string) {
    const userToken = await this.prismaService.user_token.findFirst({
      where: {
        user_id: userId,
        token: token,
      },
    });

    if (!userToken) {
      throw new NotFoundException(ErrorMessages.TOKEN_NOT_FOUND);
    }

    await this.prismaService.user_token.delete({
      where: { id: userToken.id },
    });

    return {};
  }

  /**
   * Signs a JWT token with user information.
   * @param userId - The ID of the user.
   * @param email - The email of the user.
   * @param role - The role of the user.
   * @returns - The signed JWT token.
   */
  async signToken(
    userId: string,
    email: string,
  ): Promise<string> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.config.get(ConfigKeys.JWT_SECRET);
    const timeExpired = this.config.get(ConfigKeys.TOKEN_EXPIRED);
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: timeExpired,
      secret: secret,
    });

    return token;
  }

  async googleLogin(user: any) {
    const { googleId, email, displayName, avatar } = user;

    // Remove expired tokens
    await this.removeExpiredTokens(googleId);

    // generate token
    const accessToken = await this.signToken(googleId, email);

    // Save token to user_token table
    await this.saveTokenToDatabase(googleId, accessToken, LoginType.GOOGLE);

    return {
      googleId,
      email,
      displayName,
      avatar,
      accessToken
    };
  }

  async validateToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });

      return {
        valid: true,
        user: {
          id: decoded.id,
          email: decoded.email,
          roles: decoded.roles,
        },
      };
    } catch (error) {
      throw new UnauthorizedException(ErrorMessages.INVALID_TOKEN);
    }
  }

  /**
   * Saves a token to the database with its expiration date.
   * @param userId - The ID of the user.
   * @param token - The token to be saved.
   * @returns - The created user token record.
   */
  private async saveTokenToDatabase(userId: string, token: string, loginType: LoginType) {

    const decoded = this.jwtService.decode(token) as { exp: number } | null;
    if (!decoded || !decoded.exp) {
      throw new UnauthorizedException(ErrorMessages.INVALID_TOKEN);
    }

    const expiryDate = new Date(decoded.exp * 1000);
    const isoExpiry = expiryDate.toISOString();

    const userToken = await this.prismaService.user_token.create({
      data: {
        user_id: String(userId),
        token: token,
        login_type: loginType,
        time_expiry: isoExpiry,
      },
    });

    return userToken;
  }

  /**
   * Removes expired tokens for a user.
   * @param userId - The ID of the user.
   */
  private async removeExpiredTokens(userId: string) {
    await this.prismaService.user_token.deleteMany({
      where: {
        user_id: userId,
        time_expiry: {
          lt: new Date(),
        },
      },
    });
  }
}
