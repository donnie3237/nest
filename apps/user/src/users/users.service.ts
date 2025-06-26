import { Injectable, ConflictException, NotFoundException, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@repo/entities';
import { CreateUserDto } from '@repo/dto';
import * as argon2 from 'argon2';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`[UserService] Creating user: ${createUserDto.email}`);
    const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await argon2.hash(createUserDto.password);
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(newUser);

    // Invalidate relevant cache entries
    await this.cacheManager.del('all_users'); // Cache สำหรับ findAll
    // await this.cacheManager.del(`user_${savedUser.id}`); // ถ้าคุณเคย cache user แยกแต่ละ ID

    this.logger.log(`[UserService] User ${savedUser.id} created successfully.`);
    return savedUser;
  }

  async findAll(): Promise<User[]> {
    this.logger.log('[UserService] Fetching all users.');
    const cacheKey = 'all_users';
    // Try to get from cache first
    const cachedUsers = await this.cacheManager.get<User[]>(cacheKey);
    if (cachedUsers) {
      this.logger.log('Fetching all users from cache.');
      return cachedUsers;
    }

    // If not in cache, fetch from database
    const users = await this.userRepository.find();
    this.logger.log('Fetching all users from DB and caching.');
    await this.cacheManager.set(cacheKey, users); // Cache the result
    return users;
  }

  async findOne(id: string): Promise<User | null> {
    this.logger.log(`[UserService] Fetching user by ID: ${id}`);
    const cacheKey = `user_${id}`;
    const cachedUser = await this.cacheManager.get<User>(cacheKey);
    if (cachedUser) {
      this.logger.log(`Fetching user ${id} from cache.`);
      return cachedUser;
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
        throw new NotFoundException(`User with ID "${id}" not found`);
    }
    this.logger.log(`Fetching user ${id} from DB and caching.`);
    await this.cacheManager.set(cacheKey, user);
    return user;
  }
}