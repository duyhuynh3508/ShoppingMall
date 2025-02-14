import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from "@nestjs/jwt";
import { LoggerModule } from 'nestjs-pino';
import { AuthnModule } from './authn/authn.module';
import { AuthnGuard } from './authn/guard/authn.guard';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthnModule,
    PrismaModule,
    
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.TOKEN_EXPIRED }
    }),

    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: "pino-pretty",
          options: {
            singleLine: true,
            translateTime: "SYS:yyyy-mm-ddTHH:MM:ss.l"
          }
        },
        serializers: {
          req(req) {
            req.body = req.raw.body;
            return req;
          }
        }
      }
    })

  ],
  providers: [{
    provide: APP_GUARD,
    useClass: AuthnGuard
  }],
})
export class AppModule {}
