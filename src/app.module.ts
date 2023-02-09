import { Module } from '@nestjs/common';
import { ChatController } from './controller/chat.controller';
import { ChatService } from './service/chat.service';
import * as Pusher from 'pusher';
import { PrismaService } from './prisma.service';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
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
