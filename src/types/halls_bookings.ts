// types/firebase.ts
import { Timestamp } from 'firebase/firestore';

// Base interface for all Firestore documents
export interface FirestoreDocument {
  id: string;
  created_at: Timestamp | Date;
  updated_at: Timestamp | Date;
}

// Hall Interface
export interface Hall extends FirestoreDocument {
  name: string;
  description?: string;
  capacity: number;
  area_sqft?: number;
  equipment_included: string[];
  hourly_rate: number;
  daily_rate?: number;
  security_deposit?: number;
  is_available: boolean;
  location?: string;
  rules?: string;
  images: string[];
}

// Booking Status Types
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';

// Payment Status Types
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'partial' | 'failed';

// Booking Interface
export interface Booking extends FirestoreDocument {
  hall_id: string;
  hall_name?: string; // For denormalized data
  purpose: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  num_attendees: number;
  start_time: Timestamp | Date;
  end_time: Timestamp | Date;
  duration_hours?: number;
  total_amount: number;
  amount_paid: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  notes?: string;
  
  // Optional fields for special requirements
  special_requirements?: string[];
  equipment_requested?: string[];
  setup_time?: Timestamp | Date;
  cleanup_time?: Timestamp | Date;
  
  // Reference to invoice/payment
  invoice_id?: string;
  payment_method?: string;
  transaction_id?: string;
  
  // Admin fields
  created_by?: string; // User ID who created the booking
  last_modified_by?: string;
  cancellation_reason?: string;
  cancellation_date?: Timestamp | Date;
}

// Hall Form Data (for creating/updating halls)
export interface HallFormData {
  name: string;
  description: string;
  capacity: number;
  area_sqft: string;
  equipment_included: string[];
  hourly_rate: number;
  daily_rate: string;
  security_deposit: number;
  location: string;
  rules: string;
  images: string[];
  is_available: boolean;
}

// Booking Form Data (for creating/updating bookings)
export interface BookingFormData {
  hall_id: string;
  purpose: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  num_attendees: number;
  start_time: Date;
  end_time: Date;
  total_amount: number;
  notes: string;
  special_requirements: string[];
  equipment_requested: string[];
}

// Statistics Interface
export interface HallStats {
  total_halls: number;
  available_halls: number;
  total_bookings: number;
  total_revenue: number;
  average_hourly_rate: number;
  occupancy_rate: number;
}

// Search/Filters Interface
export interface HallFilters {
  min_capacity?: number;
  max_capacity?: number;
  min_price?: number;
  max_price?: number;
  location?: string;
  equipment?: string[];
  is_available?: boolean;
  date_range?: {
    start: Date;
    end: Date;
  };
}

// Pagination Interface
export interface PaginationParams {
  page: number;
  limit: number;
  sort_by: string;
  sort_order: 'asc' | 'desc';
}

// API Response Interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// User Interface (if you have users collection)
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'staff';
  phone?: string;
  avatar?: string;
  is_active: boolean;
  created_at: Timestamp | Date;
  last_login?: Timestamp | Date;
}

// Activity Log Interface
export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: 'hall' | 'booking' | 'user';
  entity_id: string;
  entity_name: string;
  changes?: Record<string, { old: any; new: any }>;
  timestamp: Timestamp | Date;
  ip_address?: string;
  user_agent?: string;
}