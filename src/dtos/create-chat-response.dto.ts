import { Chat } from '@prisma/client';

export interface CreateChatResponseDto {
  chat?: Chat | null;

  message: string;
}
