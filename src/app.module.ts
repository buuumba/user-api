import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./auth/jwt.strategy";
import { UserModule } from "./user/user.module";
import { ConfigModule } from "@nestjs/config";
import { ProvidersModule } from "./providers/providers.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
    }),
    UserModule,
    AuthModule,
    PassportModule,
    JwtModule.register({
      secret: "your_secret_key",
      signOptions: { expiresIn: "1h" },
    }),
    AuthModule,
    ProvidersModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}
