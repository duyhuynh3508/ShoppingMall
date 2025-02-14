import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthnController } from './authn.controller';
import { AuthnService } from './authn.service';
import { AuthnGuard } from './guard/authn.guard';
import { GoogleStrategy } from './google.strategy';

@Module({
  imports: [JwtModule.register({ global: true })],
  controllers: [AuthnController],
  providers: [AuthnService, AuthnGuard, GoogleStrategy],
})
export class AuthnModule {}
