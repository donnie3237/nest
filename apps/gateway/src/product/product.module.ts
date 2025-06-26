import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductService } from './product.service';
import { ProductController } from './product.controller'; 

@Module({
    imports: [
        ConfigModule,
        ClientsModule.registerAsync([
            {
                name: 'PRODUCT_SERVICE',
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => {
                    const rabbitmqUrl = configService.get<string>('RABBITMQ_URL') || 'amqp://guest:guest@localhost:5672';
                    const userQueue = 'PRODUCT_QUEUE';

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
    controllers: [ProductController],
    providers: [ProductService],
    exports: [],
})
export class ProductModule {}