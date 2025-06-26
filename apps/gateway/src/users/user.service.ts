import { Injectable, Inject, Logger, NotFoundException, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from '@repo/dto';
import { lastValueFrom, timeout } from 'rxjs';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(@Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy) {}

  async onModuleInit() {
    try {
      await this.userServiceClient.connect();
      this.logger.log('Connected to User Microservice Client');
    } catch (error) {
      this.logger.error(`Failed to connect to User Microservice Client: ${error.message}`);
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<any> {
    this.logger.log(`[UsersService] Sending 'create_user' command for email: ${createUserDto.email}`);
    try {
      const response = await lastValueFrom(
        this.userServiceClient.send({ cmd: 'create_user' }, createUserDto).pipe(timeout(5000))
      );
      if (!response) {
        // Microservice might return null/undefined on certain errors (e.g., conflict)
        throw new ConflictException('User with this email already exists or another creation error occurred.');
      }
      return response;
    } catch (error) {
      this.logger.error(`[UsersService] Error creating user: ${error.message}`);
      if (error.name === 'TimeoutError') {
        throw new HttpException('Microservice response timed out', HttpStatus.GATEWAY_TIMEOUT);
      }
      // Re-throw if it's already an HTTP exception from the microservice or other handled error
      if (error instanceof HttpException) {
        throw error;
      }
      // General error for unexpected issues
      throw new HttpException(error.message || 'Error creating user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserDetails(userId: string): Promise<any> {
    this.logger.log(`[UsersService] Sending 'get_user_details' command for userId: ${userId}`);
    try {
      const user = await lastValueFrom(
        this.userServiceClient.send({ cmd: 'get_user_details' }, userId).pipe(timeout(5000))
      );
      if (!user) {
        // If the microservice explicitly returns null/undefined for not found
        throw new NotFoundException(`User with ID "${userId}" not found`);
      }
      return user;
    } catch (error) {
      this.logger.error(`[UsersService] Error getting user details for ${userId}: ${error.message}`);
      if (error.name === 'TimeoutError') {
        throw new HttpException('Microservice response timed out', HttpStatus.GATEWAY_TIMEOUT);
      }
      // Assuming the microservice throws NotFoundException directly or it propagates
      if (error instanceof NotFoundException || error instanceof HttpException) {
        throw error; // Re-throw the original error from the microservice/previous layer
      }
      throw new HttpException(error.message || 'Error retrieving user details', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllUsers(): Promise<any[]> {
    this.logger.log(`[UsersService] Sending 'get_all_users' command`);
    try {
      const users = await lastValueFrom(
        this.userServiceClient.send({ cmd: 'get_all_users' }, {}).pipe(timeout(5000))
      );
      return users; // Assuming the microservice always returns an array, even empty
    } catch (error) {
      this.logger.error(`[UsersService] Error getting all users: ${error.message}`);
      if (error.name === 'TimeoutError') {
        throw new HttpException('Microservice response timed out', HttpStatus.GATEWAY_TIMEOUT);
      }
      throw new HttpException(error.message || 'Error retrieving all users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async notifyUser(userId: string, message: string): Promise<void> {
    this.logger.log(`[UsersService] Emitting 'notify_user' event for user: ${userId}`);
    try {
      // Use emit for event patterns; no lastValueFrom needed as it's fire-and-forget
      this.userServiceClient.emit({ event: 'notify_user' }, { userId, message });
      this.logger.log(`[UsersService] 'notify_user' event emitted successfully.`);
    } catch (error) {
      this.logger.error(`[UsersService] Error emitting 'notify_user' event: ${error.message}`);
      throw new HttpException(error.message || 'Error sending notification event', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}