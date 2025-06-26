import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from './user.service'; // Import the new UserService
import { UserController } from './user.controller'; // Import the new UserController
@Module({
    imports: [
        ConfigModule,
        ClientsModule.registerAsync([
            {
                name: 'USER_SERVICE',
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => {
                    const rabbitmqUrl = configService.get<string>('RABBITMQ_URL') || 'amqp://guest:guest@localhost:5672';
                    const userQueue = 'USER_QUEUE';

                    return {
                        transport: Transport.RMQ,
                        options: {
                            urls: [rabbitmqUrl],
                            queue: userQueue,
                            queueOptions: { durable: false },
                        },
                    };
                },
                inject: [ConfigService], 
            },
        ]),
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [],
})
export class UserModule {}