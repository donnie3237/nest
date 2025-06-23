import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Inject,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
// import { CreateUserDto } from './dto/create-user.dto'; // หากต้องการ DTO
// import { CreateProductDto } from './dto/create-product.dto'; // หากต้องการ DTO

@Controller() // ไม่ต้องมี prefix ที่นี่ เพื่อให้จัดการ Root Path ได้
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
    @Inject('PRODUCT_SERVICE')
    private readonly productServiceClient: ClientProxy,
  ) {}

  // ===========================================
  // === Endpoints สำหรับ USERS (/users) ===
  // ===========================================

  @Post('users') // HTTP POST /users
  async createUser(@Body() createUserDto: any): Promise<any> {
    // ใช้ any หรือสร้าง DTO
    this.logger.log(
      `[Gateway] Received POST /users for email: ${createUserDto.email}`,
    );
    try {
      // ส่ง Command 'create_user' ไปยัง User Service
      const createdUser = await this.userServiceClient
        .send({ cmd: 'create_user' }, createUserDto)
        .toPromise();
      this.logger.log(
        `[Gateway] User creation command sent, response: ${JSON.stringify(createdUser)}`,
      );
      return createdUser;
    } catch (error) {
      this.logger.error(`[Gateway] Error creating user: ${error.message}`);
      throw new ConflictException(error.message); // แปลง error ที่เหมาะสม
    }
  }

  @Get('users/:id') // HTTP GET /users/:id
  async getUserById(@Param('id') id: string): Promise<any> {
    this.logger.log(`[Gateway] Received GET /users/${id}`);
    try {
      // ส่ง Command 'get_user_details' ไปยัง User Service
      const userDetails = await this.userServiceClient
        .send({ cmd: 'get_user_details' }, id)
        .toPromise();
      this.logger.log(
        `[Gateway] User details received: ${JSON.stringify(userDetails)}`,
      );
      if (!userDetails) {
        throw new NotFoundException(`User with ID "${id}" not found`);
      }
      return userDetails;
    } catch (error) {
      this.logger.error(`[Gateway] Error getting user ${id}: ${error.message}`);
      throw new NotFoundException(error.message);
    }
  }

  @Get('users') // HTTP GET /users
  async getAllUsers(): Promise<any[]> {
    this.logger.log(`[Gateway] Received GET /users (all)`);
    try {
      // ส่ง Command 'get_all_users' ไปยัง User Service
      const allUsers = await this.userServiceClient
        .send({ cmd: 'get_all_users' }, {})
        .toPromise();
      this.logger.log(`[Gateway] All users received (${allUsers.length})`);
      return allUsers;
    } catch (error) {
      this.logger.error(`[Gateway] Error getting all users: ${error.message}`);
      throw error;
    }
  }

  // =============================================
  // === Endpoints สำหรับ PRODUCTS (/products) ===
  // =============================================

  @Post('products') // HTTP POST /products
  async createProduct(@Body() createProductDto: any): Promise<any> {
    // ใช้ any หรือสร้าง DTO
    this.logger.log(
      `[Gateway] Received POST /products for product: ${createProductDto.name}`,
    );
    try {
      // ส่ง Command 'create_product' ไปยัง Product Service
      const createdProduct = await this.productServiceClient
        .send({ cmd: 'create_product' }, createProductDto)
        .toPromise();
      this.logger.log(
        `[Gateway] Product creation command sent, response: ${JSON.stringify(createdProduct)}`,
      );
      return createdProduct;
    } catch (error) {
      this.logger.error(`[Gateway] Error creating product: ${error.message}`);
      throw new ConflictException(error.message); // แปลง Error
    }
  }

  @Get('products/:id') // HTTP GET /products/:id
  async getProductById(@Param('id') id: string): Promise<any> {
    this.logger.log(`[Gateway] Received GET /products/${id}`);
    try {
      // ส่ง Command 'get_product_details' ไปยัง Product Service
      const productDetails = await this.productServiceClient
        .send({ cmd: 'get_product_details' }, id)
        .toPromise();
      this.logger.log(
        `[Gateway] Product details received: ${JSON.stringify(productDetails)}`,
      );
      if (!productDetails) {
        throw new NotFoundException(`Product with ID "${id}" not found`);
      }
      return productDetails;
    } catch (error) {
      this.logger.error(
        `[Gateway] Error getting product ${id}: ${error.message}`,
      );
      throw new NotFoundException(error.message); // แปลง Error
    }
  }

  @Get('products') // HTTP GET /products
  async getAllProducts(): Promise<any[]> {
    this.logger.log(`[Gateway] Received GET /products (all)`);
    try {
      // ส่ง Command 'get_all_products' ไปยัง Product Service
      const allProducts = await this.productServiceClient
        .send({ cmd: 'get_all_products' }, {})
        .toPromise();
      this.logger.log(
        `[Gateway] All products received (${allProducts.length})`,
      );
      return allProducts;
    } catch (error) {
      this.logger.error(
        `[Gateway] Error getting all products: ${error.message}`,
      );
      throw error;
    }
  }
}
