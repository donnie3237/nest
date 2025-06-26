import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule, DatabaseModule } from '@repo/database'
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    DatabaseModule,

    ProductModule,
  ],
  providers: [],
  controllers: [],
})

export class AppModule {}
