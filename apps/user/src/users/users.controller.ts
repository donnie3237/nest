import { Controller, Logger, NotFoundException} from '@nestjs/common';
import { MessagePattern, EventPattern } from '@nestjs/microservices'; 
import { UserService } from './users.service';
import { CreateUserDto } from '@repo/dto'; 

@Controller() 
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  //POST /user
  @MessagePattern({ cmd: 'create_user' })
  async createUser(createUserDto: CreateUserDto): Promise<any> {
    this.logger.log(`[User RMQ] Received 'create_user' command for email: ${createUserDto.email}`);
    try {
      const newUser = await this.userService.create(createUserDto);
      this.logger.log(`[User RMQ] User created with ID: ${newUser.id}`);
      return { id: newUser.id, username: newUser.username, email: newUser.email }; 
    } catch (error) {
      this.logger.error(`[User RMQ] Error creating user: ${error.message}`);

    }
  }

  //GET /user/:id
  @MessagePattern({ cmd: 'get_user_details' })
  async getUserDetails(userId: string): Promise<any> {
    this.logger.log(`[User RMQ] Received 'get_user_details' command for userId: ${userId}`);
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new NotFoundException(`User with ID "${userId}" not found`);
      }
      return { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt };
    } catch (error) {
      this.logger.error(`[User RMQ] Error getting user details for ${userId}: ${error.message}`);
      throw error;
    }
  }

  //GET /user
  @MessagePattern({ cmd: 'get_all_users' })
  async getAllUsers(): Promise<any[]> {
    this.logger.log(`[User RMQ] Received 'get_all_users' command`);
    try {
      const users = await this.userService.findAll();
      return users.map(user => ({ id: user.id, username: user.username, email: user.email }));
    } catch (error) {
      this.logger.error(`[User RMQ] Error getting all users: ${error.message}`);
      throw error; 
    }
  }

  //GET /notify
  @EventPattern({ event: 'notify_user' })
  async handleNotifyUserEvent(data: { userId: string; message: string }) {
    this.logger.log(`[User RMQ] Received 'notify_user' event for user ${data.userId}: ${data.message}`);
    try {
      this.logger.log(`[User RMQ] Processed notification for user ${data.userId}.`);
    } catch (error) {
      this.logger.error(`[User RMQ] Error processing notify_user event for ${data.userId}: ${error.message}`);
    }
  }
}