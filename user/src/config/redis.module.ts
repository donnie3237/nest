import { Module } from "@nestjs/common";
import { ConfigModule , ConfigService } from "@nestjs/config";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";
import type { RedisClientOptions } from "redis";

@Module({
  imports: [
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get<string>("REDIS_HOST"),
            port: configService.get<number>("REDIS_PORT"),
          },
        }),
        ttl: configService.get<number>("CACHE_TTL"), 
      }),
      isGlobal: true, 
    }),
  ],
})

export class  RedisModule{}