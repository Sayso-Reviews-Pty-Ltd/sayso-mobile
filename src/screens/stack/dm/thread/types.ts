export type MessageStatus = 'sending' | 'sent' | 'failed';

export interface MessageDto {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  status?: MessageStatus;
  is_local?: boolean;
}

export interface ConversationDto {
  id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar?: string | null;
  business_name?: string | null;
}

export interface MessagesApiResponse {
  messages: MessageDto[];
  conversation?: ConversationDto;
}

export interface SendMessageResponse {
  message: MessageDto;
}
