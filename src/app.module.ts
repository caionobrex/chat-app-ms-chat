import { Module } from '@nestjs/common';
import { ChatController } from './controller/chat.controller';
import { ChatService } from './providers/services/chat.service';
import { PrismaService } from './providers/services/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './providers/chat.gateway';

@Module({
  controllers: [ChatController],
  imports: [JwtModule.register({ secret: 'cat123' })],
  providers: [ChatService, PrismaService, ChatGateway],
})
export class AppModule {}
