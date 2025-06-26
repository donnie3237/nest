import { Injectable, Inject, Logger, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateProductDto } from '@repo/dto';
import { lastValueFrom, timeout } from 'rxjs';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(@Inject('PRODUCT_SERVICE') private readonly productServiceClient: ClientProxy) {}

  async onModuleInit() {
    try {
      await this.productServiceClient.connect();
      this.logger.log('Connected to Product Microservice Client');
    } catch (error) {
      this.logger.error(`Failed to connect to Product Microservice Client: ${error.message}`);
    }
  }

  async createProduct(createProductDto: CreateProductDto): Promise<any> {
    this.logger.log(`[ProductService] Sending 'create_product' command for name: ${createProductDto.name}`);
    try {
      const response = await lastValueFrom(
        this.productServiceClient.send({ cmd: 'create_product' }, createProductDto).pipe(timeout(5000))
      );
      if (!response) {
        throw new HttpException('Failed to create product or microservice returned empty response.', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      return response;
    } catch (error) {
      this.logger.error(`[ProductService] Error creating product: ${error.message}`);
      if (error.name === 'TimeoutError') {
        throw new HttpException('Microservice response timed out', HttpStatus.GATEWAY_TIMEOUT);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message || 'Error creating product', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getProductDetails(productId: string): Promise<any> {
    this.logger.log(`[ProductService] Sending 'get_product_details' command for productId: ${productId}`);
    try {
      const product = await lastValueFrom(
        this.productServiceClient.send({ cmd: 'get_product_details' }, productId).pipe(timeout(5000))
      );
      if (!product) {
        throw new NotFoundException(`Product with ID "${productId}" not found`);
      }
      return product;
    } catch (error) {
      this.logger.error(`[ProductService] Error getting product details for ${productId}: ${error.message}`);
      if (error.name === 'TimeoutError') {
        throw new HttpException('Microservice response timed out', HttpStatus.GATEWAY_TIMEOUT);
      }
      if (error instanceof NotFoundException || error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message || 'Error retrieving product details', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllProducts(): Promise<any[]> {
    this.logger.log(`[ProductService] Sending 'get_all_products' command`);
    try {
      const products = await lastValueFrom(
        this.productServiceClient.send({ cmd: 'get_all_products' }, {}).pipe(timeout(5000))
      );
      return products;
    } catch (error) {
      this.logger.error(`[ProductService] Error getting all products: ${error.message}`);
      if (error.name === 'TimeoutError') {
        throw new HttpException('Microservice response timed out', HttpStatus.GATEWAY_TIMEOUT);
      }
      throw new HttpException(error.message || 'Error retrieving all products', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}