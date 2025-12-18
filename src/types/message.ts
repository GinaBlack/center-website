import {Timestamp} from '../firebase/firebase_config'
export type MessageType = 'workshop_booking' | 'space_rental' | '3d_printing' | 'technical_support' | 
                   'training' | 'maintenance' | 'partnership' | 'general_inquiry' | 
                   'feedback' | 'billing' | 'urgent_support';

export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';

export interface ContactMessage {
  id: string;
  message_id: string;
  user_id?: string | null;
  name: string;
  email: string;
  phone_number: string;
  subject: string;
  message: string;
  message_type: MessageType;
  message_type_label: string;
  category: 'general' | 'technical' | 'billing' | 'feedback' | 'partnership';
  status: 'new' | 'read' | 'replied' | 'closed';
  priority: MessagePriority;
  assigned_to?: string | null;
  reply_message?: string;
  replied_at?: Timestamp | null;
  created_at: Timestamp;
  isImportant?: boolean;
  admin_notes?: string;
  reply_history?: {
    id: string;
    admin_email: string;
    admin_name: string;
    reply_message: string;
    timestamp: Timestamp;
  }[];
}