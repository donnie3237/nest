import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Logger,
  NotFoundException,
  ConflictException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { CreateUserDto } from '@repo/dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { UserService } from './user.service'; // Import the new UsersService

@ApiTags('users')
@Controller('users') // Base path for user-related endpoints
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly usersService: UserService) {} // Inject UsersService

  @Post() // HTTP POST /users
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto, description: 'Data for creating a new user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.' })
  @ApiResponse({ status: 409, description: 'User already exists (e.g., email conflict).' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<any> {
    this.logger.log(`[Gateway] Received POST /users for email: ${createUserDto.email}`);
    try {
      const createdUser = await this.usersService.createUser(createUserDto);
      this.logger.log(`[Gateway] User creation command sent, response: ${JSON.stringify(createdUser)}`);
      return createdUser;
    } catch (error) {
      this.logger.error(`[Gateway] Error creating user: ${error.message}`);
      // Propagate specific HTTP exceptions or return a generic 500
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof HttpException) {
        throw error; // Re-throw NestJS HTTP exceptions directly
      }
      throw new HttpException(error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id') // HTTP GET /users/:id
  @ApiOperation({ summary: 'Get user details by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the user' })
  @ApiResponse({ status: 200, description: 'User details retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getUserById(@Param('id') id: string): Promise<any> {
    this.logger.log(`[Gateway] Received GET /users/${id}`);
    try {
      const userDetails = await this.usersService.getUserDetails(id);
      this.logger.log(`[Gateway] User details received: ${JSON.stringify(userDetails)}`);
      if (!userDetails) {
        // This case should be caught by the service if the microservice returns null/undefined
        // but adding an extra check here for robustness
        throw new NotFoundException(`User with ID "${id}" not found`);
      }
      return userDetails;
    } catch (error) {
      this.logger.error(`[Gateway] Error getting user ${id}: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get() // HTTP GET /users
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users retrieved successfully.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getAllUsers(): Promise<any[]> {
    this.logger.log(`[Gateway] Received GET /users (all)`);
    try {
      const allUsers = await this.usersService.getAllUsers();
      this.logger.log(`[Gateway] All users received (${allUsers.length})`);
      return allUsers;
    } catch (error) {
      this.logger.error(`[Gateway] Error getting all users: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('notify')
  @ApiOperation({ summary: 'Send a notification event to a user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'some-user-id' },
        message: { type: 'string', example: 'Hello from the gateway!' },
      },
    },
    description: 'Data for sending a notification to a user',
  })
  @ApiResponse({ status: 202, description: 'Notification event accepted for processing.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async notifyUser(@Body() data: { userId: string; message: string }) {
    this.logger.log(`[Gateway] Received POST /users/notify request for userId: ${data.userId}`);
    try {
      await this.usersService.notifyUser(data.userId, data.message);
      this.logger.log(`[Gateway] Emitted 'notify_user' event for user: ${data.userId}`);
      return { message: 'Notification event sent successfully' };
    } catch (error) {
      this.logger.error(`[Gateway] Error during notifyUser: ${error.message}`);
      throw new HttpException(error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
