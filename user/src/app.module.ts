import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

//config module
import { RedisModule } from "./config/redis.module";
import { DatabaseModule } from "./config/database.module";

// app module
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
