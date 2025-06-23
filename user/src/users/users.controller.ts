import { Controller, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { MessagePattern, EventPattern } from '@nestjs/microservices'; // <--- Decorators สำหรับรับข้อความ
import { UserService } from './users.service'; // Business Logic
import { CreateUserDto } from './dto/create-user.dto'; // DTO

@Controller() // ไม่ต้องมี prefix path เพราะเป็น Microservice Controller
export class UserMicroserviceController {
  private readonly logger = new Logger(UserMicroserviceController.name);

  constructor(private readonly userService: UserService) {}

  // ===========================================
  // === MessagePattern: รับคำสั่งจาก Gateway ===
  // ===========================================

  // Gateway ส่ง: .send({ cmd: 'create_user' }, createUserDto)
  @MessagePattern({ cmd: 'create_user' })
  async createUser(createUserDto: CreateUserDto): Promise<any> {
    this.logger.log(`[User RMQ] Received 'create_user' command for email: ${createUserDto.email}`);
    try {
      const newUser = await this.userService.create(createUserDto);
      this.logger.log(`[User RMQ] User created with ID: ${newUser.id}`);
      return { id: newUser.id, username: newUser.username, email: newUser.email }; // ส่งข้อมูลกลับไปให้ Gateway
    } catch (error) {
      this.logger.error(`[User RMQ] Error creating user: ${error.message}`);
      // NestJS จะแปลง Error ที่ throw จากตรงนี้กลับไปให้ Gateway ฝั่ง Client โดยอัตโนมัติ
      // Gateway สามารถจับ Error นี้ได้ใน .catch ของ toPromise()
      throw new ConflictException(error.message); // ตัวอย่างการโยน Error ที่เหมาะสม
    }
  }

  // Gateway ส่ง: .send({ cmd: 'get_user_details' }, id)
  @MessagePattern({ cmd: 'get_user_details' })
  async getUserDetails(userId: string): Promise<any> {
    this.logger.log(`[User RMQ] Received 'get_user_details' command for userId: ${userId}`);
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        // ถ้าไม่พบผู้ใช้ ให้โยน Error ที่ Gateway จะจับได้เป็น NotFoundException
        throw new NotFoundException(`User with ID "${userId}" not found`);
      }
      return { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt };
    } catch (error) {
      this.logger.error(`[User RMQ] Error getting user details for ${userId}: ${error.message}`);
      // โยน Error กลับไปให้ Gateway
      throw error; // หรือ new NotFoundException(error.message) ถ้า Error มาจาก DB
    }
  }

  // Gateway ส่ง: .send({ cmd: 'get_all_users' }, {})
  @MessagePattern({ cmd: 'get_all_users' })
  async getAllUsers(): Promise<any[]> {
    this.logger.log(`[User RMQ] Received 'get_all_users' command`);
    try {
      const users = await this.userService.findAll();
      return users.map(user => ({ id: user.id, username: user.username, email: user.email }));
    } catch (error) {
      this.logger.error(`[User RMQ] Error getting all users: ${error.message}`);
      throw error; // โยน Error กลับไป
    }
  }

  // ===========================================
  // === EventPattern: รับเหตุการณ์จาก Gateway ===
  // ===========================================

  // Gateway ส่ง: .emit({ event: 'notify_user' }, { userId, message })
  @EventPattern({ event: 'notify_user' })
  async handleNotifyUserEvent(data: { userId: string; message: string }) {
    this.logger.log(`[User RMQ] Received 'notify_user' event for user ${data.userId}: ${data.message}`);
    // นี่คือ Logic ที่ User Service จะทำเมื่อได้รับ Event นี้
    // ตัวอย่าง: ส่ง Email, SMS, หรือบันทึก Notification ใน DB
    try {
      // await this.userService.sendNotification(data.userId, data.message);
      this.logger.log(`[User RMQ] Processed notification for user ${data.userId}.`);
    } catch (error) {
      this.logger.error(`[User RMQ] Error processing notify_user event for ${data.userId}: ${error.message}`);
      // Event patterns ไม่คืนค่ากลับไป แต่คุณควรจัดการ Log หรือการกู้คืน/แจ้งเตือนภายใน
    }
  }
}