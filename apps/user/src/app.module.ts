import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RedisModule , DatabaseModule } from "@repo/database";

import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    DatabaseModule,

    UsersModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
