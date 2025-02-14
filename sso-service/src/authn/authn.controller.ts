import { Body, Controller, Get, Headers, Post, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { Endpoints } from "../common/constants/endpoint";
import { AuthnService } from "./authn.service";
import { AuthGuard } from "@nestjs/passport";
import { AdminRequest } from "./request/admin.requets";
import { RegisterRequest } from "./request/register.request";

@Controller(Endpoints.AUTHN)
export class AuthnController {
  constructor(private authnService: AuthnService) {
  }

  @Post(Endpoints.REGISTER)
  register(@Body() registerReq: RegisterRequest) {
    return this.authnService.register(registerReq);
  }

  @Post(Endpoints.LOGIN)
  login(@Body() adminReq: AdminRequest) {
    return this.authnService.login(adminReq);
  }

  @Post(Endpoints.LOGOUT)
  logout(@Req() req) {
    const userId = req.user.sub;
    const token = req.headers.authorization.split(" ")[1];
    return this.authnService.logout(userId, token);
  }

  @Get(Endpoints.GOOGLE)
  @UseGuards(AuthGuard('google'))
  googleLogin() {
  }

  @Get(Endpoints.GOOGLE + Endpoints.REDIRECT)
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    return this.authnService.googleLogin(req.user);
  }

  @Get('health')
  checkHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('validate-token')
  async validateToken(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token is missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    return this.authnService.validateToken(token);
  }
}
