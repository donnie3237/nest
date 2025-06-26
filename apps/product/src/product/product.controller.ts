import { Controller, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { MessagePattern, EventPattern } from '@nestjs/microservices';
import { ProductService } from './product.service';
import { CreateProductDto } from '@repo/dto'; 
import { UpdateProductDto } from '@repo/dto';
import { Product } from './interfaces/product.interface';

@Controller()
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(private readonly productService: ProductService) {}

  @MessagePattern({ cmd: 'create_product' })
  async createProduct(createProductDto: CreateProductDto): Promise<Partial<Product>> {
    this.logger.log(`[Product RMQ] Received 'create_product' command for product: ${createProductDto.name}`);
    try {
      const newProduct = await this.productService.create(createProductDto);
      this.logger.log(`[Product RMQ] Product created with ID: ${newProduct.id}`);
      return { id: newProduct.id, name: newProduct.name, price: newProduct.price, stock: newProduct.stock };
    } catch (error) {
      this.logger.error(`[Product RMQ] Error creating product: ${error.message}`);
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @MessagePattern({ cmd: 'get_product_details' })
  async getProductDetails(productId: string): Promise<Partial<Product>> {
    this.logger.log(`[Product RMQ] Received 'get_product_details' command for productId: ${productId}`);
    try {
      const product = await this.productService.findOne(productId);
      // Return only essential details
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        createdAt: product.createdAt,
      };
    } catch (error) {
      this.logger.error(`[Product RMQ] Error getting product details for ${productId}: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error; // Re-throw the original error
    }
  }

  @MessagePattern({ cmd: 'get_all_products' })
  async getAllProducts(): Promise<Partial<Product>[]> {
    this.logger.log(`[Product RMQ] Received 'get_all_products' command`);
    try {
      const products = await this.productService.findAll();
      return products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
      }));
    } catch (error) {
      this.logger.error(`[Product RMQ] Error getting all products: ${error.message}`);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'update_product' })
  async updateProduct(payload: { id: string; updateProductDto: UpdateProductDto }): Promise<Partial<Product>> {
    const { id, updateProductDto } = payload;
    this.logger.log(`[Product RMQ] Received 'update_product' command for productId: ${id}`);
    try {
      const updatedProduct = await this.productService.update(id, updateProductDto);
      this.logger.log(`[Product RMQ] Product with ID '${id}' updated.`);
      return { id: updatedProduct.id, name: updatedProduct.name, price: updatedProduct.price, stock: updatedProduct.stock, updatedAt: updatedProduct.updatedAt };
    } catch (error) {
      this.logger.error(`[Product RMQ] Error updating product ${id}: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @MessagePattern({ cmd: 'delete_product' })
  async deleteProduct(productId: string): Promise<{ success: boolean }> {
    this.logger.log(`[Product RMQ] Received 'delete_product' command for productId: ${productId}`);
    try {
      const success = await this.productService.remove(productId);
      this.logger.log(`[Product RMQ] Product with ID '${productId}' deleted.`);
      return { success };
    } catch (error) {
      this.logger.error(`[Product RMQ] Error deleting product ${productId}: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @EventPattern({ event: 'product_purchased' })
  async handleProductPurchasedEvent(data: { productId: string; quantity: number }) {
    this.logger.log(`[Product RMQ] Received 'product_purchased' event for product ${data.productId}, quantity: ${data.quantity}`);
    try {
      this.logger.log(`[Product RMQ] Processed 'product_purchased' event for product ${data.productId}.`);
    } catch (error) {
      this.logger.error(`[Product RMQ] Error processing 'product_purchased' event for ${data.productId}: ${error.message}`);
    }
  }
}