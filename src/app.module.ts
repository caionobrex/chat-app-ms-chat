import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './controller/chat.controller';
import { ChatService } from './service/chat.service';
import * as Pusher from 'pusher';
import { PrismaService } from './prisma.service';

const pusher = new Pusher({
  appId: '1513456',
  key: '17c198678267f49145cc',
  secret: '1a4fbbae3844669283a5',
  cluster: 'mt1',
  useTLS: true,
});

@Module({
  controllers: [ChatController],
  providers: [
    ChatService,
    PrismaService,
    { provide: 'PUSHER_SERVICE', useValue: pusher },
  ],
})
export class AppModule {}
