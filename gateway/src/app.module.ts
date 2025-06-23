import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    ClientsModule.registerAsync([
      {
        name: 'USER_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          // Provide a fallback string if the env var is undefined
          const rabbitmqUrl = configService.get<string>('RABBITMQ_URL') || 'amqp://guest:guest@localhost:5672';
          const userQueue = configService.get<string>('USER_RABBITMQ_QUEUE') || 'USER_QUEUE';

          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitmqUrl], // Now guaranteed to be string[] (or just string)
              queue: userQueue,    // Now guaranteed to be string
              queueOptions: { durable: false },
            },
          };
        },
        inject: [ConfigService],
      },
      {
        name: 'PRODUCT_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          // Provide a fallback string if the env var is undefined
          const rabbitmqUrl = configService.get<string>('RABBITMQ_URL') || 'amqp://guest:guest@localhost:5672';
          const productQueue = configService.get<string>('PRODUCT_RABBITMQ_QUEUE') || 'PRODUCT_QUEUE';

          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitmqUrl], // Guaranteed string[]
              queue: productQueue, // Guaranteed string
              queueOptions: { durable: false },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [
    AppController,
  ],
  providers: [AppService],
})
export class AppModule {}