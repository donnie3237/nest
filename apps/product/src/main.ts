import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

export async function createApp(): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(), 
  );
  return app;
}

async function bootstrap() {
  const app = await createApp();
  const rabbitmqUrl = process.env.RABBITMQ_URL;
  const rabbitmqQueue = 'PRODUCT_QUEUE';

  if (!rabbitmqUrl) {
    throw new Error('RABBITMQ_URL environment variable is not set!');
  }

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: rabbitmqQueue,
      queueOptions: {
        durable: false, 
      },
    },
  });

  await app.startAllMicroservices(); 
  console.log(`Microservice is listening on RabbitMQ queue '${rabbitmqQueue}'`);
}

bootstrap();
