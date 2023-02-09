import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as Pusher from 'pusher';
import { CreateChatRequestDto } from 'src/dtos/create-chat-request.dto';
import { CreateMessageRequestDto } from 'src/dtos/create-message-request.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('PUSHER_SERVICE') private readonly pusher: Pusher,
  ) {}

  findAllChats(userId: number) {
    return this.prismaService.chat.findMany({
      where: {
        participants: { some: { id: userId } },
        messagesCount: { gte: 0 },
      },
      select: {
        id: true,
        messagesCount: true,
        participants: { select: { id: true, username: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            body: true,
            senderId: true,
            receiverId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findChatById(id: string, userId: number) {
    const chat = await this.prismaService.chat.findUnique({
      where: { id },
      select: {
        id: true,
        messagesCount: true,
        messages: {
          select: {
            id: true,
            body: true,
            senderId: true,
            receiverId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        participants: { select: { id: true, username: true } },
      },
    });
    if (!chat.participants.find((participant) => participant.id === userId))
      throw new UnauthorizedException();
    return chat;
  }

  async createChat(data: CreateChatRequestDto) {
    const chat = await this.prismaService.chat.create({
      data: {
        participants: {
          connect: [{ id: data.participants[0] }, { id: data.participants[1] }],
        },
      },
    });
    return chat;
  }

  async createMessage(data: CreateMessageRequestDto) {
    const chat = await this.prismaService.chat.findUnique({
      where: { id: data.chatId },
      include: { participants: true },
    });
    if (
      !chat.participants.find((participant) => participant.id === data.senderId)
    )
      throw new UnauthorizedException();
    const receiver = chat.participants.find(
      (participant) => participant.id !== data.senderId,
    );
    const message = await this.prismaService.message.create({
      data: {
        body: data.message,
        senderId: data.senderId,
        receiverId: receiver.id,
        chatId: data.chatId,
      },
    });
    await this.prismaService.chat.update({
      where: { id: chat.id },
      data: { updatedAt: new Date(), messagesCount: { increment: 1 } },
    });
    // this.pusher.trigger(data.chatId, 'message-created', message);
    return message;
  }

  async deleteMessage(messageId: string, userId: number) {
    const message = await this.prismaService.message.findUnique({
      where: { id: messageId },
      include: { chat: true },
    });
    if (message.senderId !== userId) throw new UnauthorizedException();
    await this.prismaService.message.delete({ where: { id: messageId } });
    await this.prismaService.chat.update({
      where: { id: message.chatId },
      data: { updatedAt: new Date(), messagesCount: { decrement: 1 } },
    });
    // this.pusher.trigger(message.chat.id, 'message-deleted', message);
    return message;
  }

  async userCreatedHandler(data: { id: number; name: string }) {
    await this.prismaService.participant.create({
      data: { id: data.id, username: data.name },
    });
  }
}
