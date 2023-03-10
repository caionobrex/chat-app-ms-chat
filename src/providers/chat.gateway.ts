import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ChatService } from './services/chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  @SubscribeMessage('joinChat')
  @UseGuards(JwtAuthGuard)
  async joinChatHandler(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const token = client.handshake.headers.authorization;
      const payload = this.jwtService.verify(token);
      const chat = await this.chatService.findChatById(data.chatId, payload.id);
      if (!chat) {
        client.emit('joinChat', {
          message: 'You can not join a chat you are not part of.',
          statusCode: 401,
        });
      } else {
        client.join(data.chatId);
        client.emit('joinChat', { message: 'Success', statusCode: 200 });
      }
    } catch (err) {
      client.emit('joinChat', { message: 'Internal error', statusCode: 500 });
    }
  }

  @SubscribeMessage('createMessage')
  @UseGuards(JwtAuthGuard)
  async createMessageHandler(
    @MessageBody() data: { chatId: string; message: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const token = client.handshake.headers.authorization;
    const payload = this.jwtService.verify(token);
    const message = await this.chatService.createMessage({
      chatId: data.chatId,
      message: data.message,
      senderId: payload.id,
    });
    this.server.to(data.chatId).emit('messageCreated', message);
  }

  @SubscribeMessage('deleteMessage')
  @UseGuards(JwtAuthGuard)
  async deleteMessageHandler(
    @MessageBody() data: { messageId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const token = client.handshake.headers.authorization;
    const payload = this.jwtService.verify(token);
    const deletedMessage = await this.chatService.deleteMessage(
      data.messageId,
      payload.id,
    );
    this.server
      .to(deletedMessage.chat.id)
      .emit('messageDeleted', deletedMessage);
  }
}
