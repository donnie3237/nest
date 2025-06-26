import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Logger,
  NotFoundException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { CreateProductDto } from '@repo/dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { ProductService } from './product.service';

@ApiTags('products')
@Controller('products') // Base path for product-related endpoints
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(private readonly productsService: ProductService) {} // Inject ProductsService

  @Post() // HTTP POST /products
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ type: CreateProductDto, description: 'Data for creating a new product' })
  @ApiResponse({ status: 201, description: 'The product has been successfully created.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async createProduct(@Body() createProductDto: CreateProductDto): Promise<any> {
    this.logger.log(`[Gateway] Received POST /products for name: ${createProductDto.name}`);
    try {
      const createdProduct = await this.productsService.createProduct(createProductDto);
      this.logger.log(`[Gateway] Product creation command sent, response: ${JSON.stringify(createdProduct)}`);
      return createdProduct;
    } catch (error) {
      this.logger.error(`[Gateway] Error creating product: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id') // HTTP GET /products/:id
  @ApiOperation({ summary: 'Get product details by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the product' })
  @ApiResponse({ status: 200, description: 'Product details retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getProductById(@Param('id') id: string): Promise<any> {
    this.logger.log(`[Gateway] Received GET /products/${id}`);
    try {
      const productDetails = await this.productsService.getProductDetails(id);
      this.logger.log(`[Gateway] Product details received: ${JSON.stringify(productDetails)}`);
      if (!productDetails) {
        throw new NotFoundException(`Product with ID "${id}" not found`);
      }
      return productDetails;
    } catch (error) {
      this.logger.error(`[Gateway] Error getting product ${id}: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get() // HTTP GET /products
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'List of all products retrieved successfully.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getAllProducts(): Promise<any[]> {
    this.logger.log(`[Gateway] Received GET /products (all)`);
    try {
      const allProducts = await this.productsService.getAllProducts();
      this.logger.log(`[Gateway] All products received (${allProducts.length})`);
      return allProducts;
    } catch (error) {
      this.logger.error(`[Gateway] Error getting all products: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
