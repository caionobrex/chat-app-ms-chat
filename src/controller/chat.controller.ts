import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CreateMessageRequestDto } from 'src/dtos/create-message-request.dto';
import { ChatService } from 'src/providers/services/chat.service';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @EventPattern('user-created')
  async userCreatedHandler(data: any) {
    this.chatService.userCreatedHandler(data);
  }

  @MessagePattern({ cmd: 'get-all-chats' })
  findAllChats(@Payload() data: { userId: number }) {
    return this.chatService.findAllChats(data.userId);
  }

  @MessagePattern({ cmd: 'get-chat-by-id' })
  async findChat(@Payload() data: { id: string; userId: number }) {
    try {
      const chat = await this.chatService.findChatById(data.id, data.userId);
      return { chat };
    } catch (err) {
      return {
        chat: null,
        message: err.message,
      };
    }
  }

  @MessagePattern({ cmd: 'create-chat' })
  createChat(@Payload() data: { participants: number[] }) {
    return this.chatService.createChat({ participants: data.participants });
  }

  @MessagePattern({ cmd: 'create-message' })
  createMessage(@Payload() data: CreateMessageRequestDto) {
    return this.chatService.createMessage(data);
  }

  @MessagePattern({ cmd: 'delete-message' })
  deleteMessage(@Payload() data: { userId: number; messageId: string }) {
    return this.chatService.deleteMessage(data.messageId, data.userId);
  }
}
