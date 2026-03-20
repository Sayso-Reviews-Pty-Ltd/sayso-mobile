export interface ConversationDto {
  id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar?: string | null;
  business_id?: string | null;
  business_name?: string | null;
  last_message?: string | null;
  last_message_at?: string | null;
  unread_count: number;
}

export interface ConversationsApiResponse {
  conversations: ConversationDto[];
}
