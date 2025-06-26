declare module 'gateway/src/app.controller' {
  import { AppService } from 'gateway/src/app.service';
  export class AppController {
      private readonly appService;
      constructor(appService: AppService);
      getHello(): string;
  }

}
declare module 'gateway/src/app.module' {
  export class AppModule {
  }

}
declare module 'gateway/src/app.service' {
  export class AppService {
      getHello(): string;
  }

}
declare module 'gateway/src/main' {
  import "reflect-metadata";
  import { NestFastifyApplication } from "@nestjs/platform-fastify";
  export function createApp(): Promise<NestFastifyApplication>;

}
declare module 'gateway/src/product/product.controller' {
  import { CreateProductDto } from '@repo/dto';
  import { ProductService } from 'gateway/src/product/product.service';
  export class ProductController {
      private readonly productsService;
      private readonly logger;
      constructor(productsService: ProductService);
      createProduct(createProductDto: CreateProductDto): Promise<any>;
      getProductById(id: string): Promise<any>;
      getAllProducts(): Promise<any[]>;
  }

}
declare module 'gateway/src/product/product.module' {
  export class ProductModule {
  }

}
declare module 'gateway/src/product/product.service' {
  import { ClientProxy } from '@nestjs/microservices';
  import { CreateProductDto } from '@repo/dto';
  export class ProductService {
      private readonly productServiceClient;
      private readonly logger;
      constructor(productServiceClient: ClientProxy);
      onModuleInit(): Promise<void>;
      createProduct(createProductDto: CreateProductDto): Promise<any>;
      getProductDetails(productId: string): Promise<any>;
      getAllProducts(): Promise<any[]>;
  }

}
declare module 'gateway/src/users/user.controller' {
  import { CreateUserDto } from '@repo/dto';
  import { UserService } from 'gateway/src/users/user.service';
  export class UserController {
      private readonly usersService;
      private readonly logger;
      constructor(usersService: UserService);
      createUser(createUserDto: CreateUserDto): Promise<any>;
      getUserById(id: string): Promise<any>;
      getAllUsers(): Promise<any[]>;
      notifyUser(data: {
          userId: string;
          message: string;
      }): Promise<{
          message: string;
      }>;
  }

}
declare module 'gateway/src/users/user.module' {
  export class UserModule {
  }

}
declare module 'gateway/src/users/user.service' {
  import { ClientProxy } from '@nestjs/microservices';
  import { CreateUserDto } from '@repo/dto';
  export class UserService {
      private readonly userServiceClient;
      private readonly logger;
      constructor(userServiceClient: ClientProxy);
      onModuleInit(): Promise<void>;
      createUser(createUserDto: CreateUserDto): Promise<any>;
      getUserDetails(userId: string): Promise<any>;
      getAllUsers(): Promise<any[]>;
      notifyUser(userId: string, message: string): Promise<void>;
  }

}
declare module 'gateway/test/app.e2e-spec' {
  export {};

}
declare module 'gateway' {
  import main = require('gateway/**/*');
  export = main;
}