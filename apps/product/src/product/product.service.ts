import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { Product } from './interfaces/product.interface';
import { CreateProductDto } from '@repo/dto';
import { UpdateProductDto } from '@repo/dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  private readonly products: Product[] = [];

  async create(createProductDto: CreateProductDto): Promise<Product> {
    this.logger.log(`Attempting to create product: ${createProductDto.name}`);

    const existingProduct = this.products.find(p => p.name === createProductDto.name);
    if (existingProduct) {
      this.logger.warn(`Product with name '${createProductDto.name}' already exists.`);
      throw new ConflictException(`Product with name '${createProductDto.name}' already exists`);
    }

    const newProduct: Product = {
      id: uuidv4(),
      ...createProductDto,
      createdAt: new Date(),
    };
    this.products.push(newProduct); // Add to mock database
    this.logger.log(`Product created with ID: ${newProduct.id}`);
    return newProduct;
  }

  // GET /products/:id
  async findOne(id: string): Promise<Product> {
    this.logger.log(`Attempting to find product with ID: ${id}`);
    const product = this.products.find(p => p.id === id);
    if (!product) {
      this.logger.warn(`Product with ID '${id}' not found.`);
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }
    this.logger.log(`Found product: ${product.name}`);
    return product;
  }

  //GET /products
  async findAll(): Promise<Product[]> {
    this.logger.log('Attempting to find all products.');
    return this.products;
  }

  // PUT /products/:id
  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    this.logger.log(`Attempting to update product with ID: ${id}`);
    const productIndex = this.products.findIndex(p => p.id === id);

    if (productIndex === -1) {
      this.logger.warn(`Product with ID '${id}' not found for update.`);
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }

    const updatedProduct = {
      ...this.products[productIndex],
      ...updateProductDto,
      updatedAt: new Date(),
    };
    this.products[productIndex] = updatedProduct; // Update in mock database
    this.logger.log(`Product with ID '${id}' updated.`);
    return updatedProduct;
  }

  // DELETE /products/:id
  async remove(id: string): Promise<boolean> {
    this.logger.log(`Attempting to remove product with ID: ${id}`);
    const initialLength = this.products.length;
    // Filter out the product to remove from the mock database
    const filteredProducts = this.products.filter(p => p.id !== id);

    if (filteredProducts.length === initialLength) {
      this.logger.warn(`Product with ID '${id}' not found for deletion.`);
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }

    this.products.splice(0, this.products.length, ...filteredProducts);
    this.logger.log(`Product with ID '${id}' removed.`);
    return true;
  }
}