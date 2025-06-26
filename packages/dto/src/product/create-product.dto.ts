import { IsString, IsNotEmpty, IsNumber, IsPositive, Min, MinLength, MaxLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string; 

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500) 
  description: string; 

  @IsNumber()
  @IsPositive() 
  @IsNotEmpty()
  @Min(0)
  price: number; 

  @IsNumber()
  @Min(0) 
  @IsNotEmpty()
  stock: number;
}