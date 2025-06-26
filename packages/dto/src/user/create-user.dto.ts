import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @MinLength(3)
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
