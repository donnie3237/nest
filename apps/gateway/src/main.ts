import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
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
  const app = await createApp(); 

  await app.listen(8000, "0.0.0.0"); 
  console.log(`Gateway Service is running on HTTP port: ${await app.getUrl()}`);
}

bootstrap();