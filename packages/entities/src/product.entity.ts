import { Column, CreateDateColumn, PrimaryColumn, UpdateDateColumn } from "typeorm";

export class Product {
  @PrimaryColumn({ type: 'varchar', length: 36 }) // Example TypeORM primary key
  id: string; // Unique identifier for the product

  @Column({ type: 'varchar', length: 255, unique: true }) // Example TypeORM column
  name: string; // Name of the product

  @Column({ type: 'text' }) // Example TypeORM column
  description: string; // Description of the product

  @Column({ type: 'decimal', precision: 10, scale: 2 }) // Example TypeORM column
  price: number; // Price of the product

  @Column({ type: 'int', default: 0 }) // Example TypeORM column
  stock: number; // Current stock of the product

  @CreateDateColumn() // Example TypeORM decorator for creation timestamp
  createdAt: Date; // Timestamp when the product was created

  @UpdateDateColumn() // Example TypeORM decorator for update timestamp
  updatedAt?: Date; // Optional timestamp when the product was last updated
}