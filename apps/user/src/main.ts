import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";

export async function createApp(): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  return app;
}

async function bootstrap() {
  const app = await createApp(); // Creates the Fastify HTTP application

  const rabbitmqUrl = process.env.RABBITMQ_URL;
  const rabbitmqQueue = process.env.RABBITMQ_QUEUE || 'USER_QUEUE'; // Provide a default or ensure it's always set

  // Basic validation: Ensure the URL is provided
  if (!rabbitmqUrl) {
    throw new Error('RABBITMQ_URL environment variable is not set!');
  }

  // Configure and connect the Microservice listener for RabbitMQ (RMQ)
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl], // Use the single URL string directly
      queue: rabbitmqQueue,
      queueOptions: {
        durable: false // Set to true for persistent queues in production
      },
    },
  });

  // Start all connected microservices
  await app.startAllMicroservices();

  // Listen for HTTP requests
  const httpPort = process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT, 10) : 8888;
  await app.listen(httpPort, "0.0.0.0");

  console.log(`HTTP server is running on: ${await app.getUrl()}`);
  console.log(`Microservice is listening on RabbitMQ queue '${rabbitmqQueue}'`);
}

bootstrap();