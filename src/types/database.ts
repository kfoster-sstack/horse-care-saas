/**
 * Supabase Database Types
 * Auto-generated types that match the database schema
 *
 * Note: In production, you should generate these using:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Enum types matching PostgreSQL enums
export type UserRole = 'owner' | 'manager' | 'staff' | 'volunteer' | 'boarder';
export type UserMode = 'standard' | 'trainer' | 'staff' | 'boarder';
export type SubscriptionTier = 'free' | 'team' | 'business';
export type HorseGender = 'mare' | 'gelding' | 'stallion';
export type CareActivityType =
  | 'feeding'
  | 'turnout'
  | 'blanketing'
  | 'medication'
  | 'exercise'
  | 'grooming'
  | 'health_check'
  | 'farrier'
  | 'vet_visit'
  | 'other';
export type ReminderType =
  | 'vaccination'
  | 'farrier'
  | 'vet_checkup'
  | 'dental'
  | 'deworming'
  | 'feeding'
  | 'medication'
  | 'exercise'
  | 'grooming'
  | 'supplement'
  | 'coggins'
  | 'other';
export type RepeatInterval =
  | 'never'
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'biannually'
  | 'yearly';
export type PriorityLevel = 'low' | 'medium' | 'high';
export type DocumentCategory =
  | 'health_records'
  | 'registration'
  | 'contracts'
  | 'insurance'
  | 'photos'
  | 'coggins'
  | 'other';
export type CalendarEventType =
  | 'vet_visit'
  | 'farrier'
  | 'lesson'
  | 'show'
  | 'vaccination'
  | 'other';
export type EmergencyContactRole =
  | 'veterinarian'
  | 'farrier'
  | 'barn_manager'
  | 'owner'
  | 'other';
export type AlertType =
  | 'injury'
  | 'illness'
  | 'medication'
  | 'dietary'
  | 'behavioral'
  | 'quarantine'
  | 'other';
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';
export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';
export type MemberStatus = 'active' | 'pending' | 'inactive';

// Database table types
export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string;
          name: string;
          code: string;
          owner_id: string;
          subscription_tier: SubscriptionTier;
          subscription_max_users: number;
          subscription_price: number;
          subscription_expires_at: string | null;
          timezone: string;
          preferences: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          code?: string;
          owner_id: string;
          subscription_tier?: SubscriptionTier;
          subscription_max_users?: number;
          subscription_price?: number;
          subscription_expires_at?: string | null;
          timezone?: string;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          owner_id?: string;
          subscription_tier?: SubscriptionTier;
          subscription_max_users?: number;
          subscription_price?: number;
          subscription_expires_at?: string | null;
          timezone?: string;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          phone: string | null;
          user_mode: UserMode;
          preferences: Json;
          push_tokens: Json;
          business_code: string | null;
          created_at: string;
          updated_at: string;
          last_login: string | null;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          user_mode?: UserMode;
          preferences?: Json;
          push_tokens?: Json;
          business_code?: string | null;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          user_mode?: UserMode;
          preferences?: Json;
          push_tokens?: Json;
          business_code?: string | null;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
        };
      };
      business_members: {
        Row: {
          id: string;
          business_id: string;
          user_id: string;
          role: UserRole;
          status: MemberStatus;
          assigned_horse_ids: string[];
          owned_horse_ids: string[];
          is_active: boolean;
          joined_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          user_id: string;
          role?: UserRole;
          status?: MemberStatus;
          assigned_horse_ids?: string[];
          owned_horse_ids?: string[];
          is_active?: boolean;
          joined_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          user_id?: string;
          role?: UserRole;
          status?: MemberStatus;
          assigned_horse_ids?: string[];
          owned_horse_ids?: string[];
          is_active?: boolean;
          joined_at?: string;
          updated_at?: string;
        };
      };
      team_invites: {
        Row: {
          id: string;
          business_id: string;
          email: string;
          name: string | null;
          role: UserRole;
          assigned_horse_ids: string[];
          invite_token: string;
          status: InviteStatus;
          invited_by: string | null;
          invited_at: string;
          expires_at: string;
          accepted_at: string | null;
        };
        Insert: {
          id?: string;
          business_id: string;
          email: string;
          name?: string | null;
          role?: UserRole;
          assigned_horse_ids?: string[];
          invite_token?: string;
          status?: InviteStatus;
          invited_by?: string | null;
          invited_at?: string;
          expires_at?: string;
          accepted_at?: string | null;
        };
        Update: {
          id?: string;
          business_id?: string;
          email?: string;
          name?: string | null;
          role?: UserRole;
          assigned_horse_ids?: string[];
          invite_token?: string;
          status?: InviteStatus;
          invited_by?: string | null;
          invited_at?: string;
          expires_at?: string;
          accepted_at?: string | null;
        };
      };
      horses: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          breed: string | null;
          color: string | null;
          gender: HorseGender | null;
          birth_date: string | null;
          registration_number: string | null;
          stall_location: string | null;
          photo_url: string | null;
          photos: string[];
          allergies: string[];
          medications: string[];
          special_needs: string | null;
          notes: string | null;
          feeding_schedule: Json;
          owner_user_id: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          breed?: string | null;
          color?: string | null;
          gender?: HorseGender | null;
          birth_date?: string | null;
          registration_number?: string | null;
          stall_location?: string | null;
          photo_url?: string | null;
          photos?: string[];
          allergies?: string[];
          medications?: string[];
          special_needs?: string | null;
          notes?: string | null;
          feeding_schedule?: Json;
          owner_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          breed?: string | null;
          color?: string | null;
          gender?: HorseGender | null;
          birth_date?: string | null;
          registration_number?: string | null;
          stall_location?: string | null;
          photo_url?: string | null;
          photos?: string[];
          allergies?: string[];
          medications?: string[];
          special_needs?: string | null;
          notes?: string | null;
          feeding_schedule?: Json;
          owner_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      horse_emergency_contacts: {
        Row: {
          id: string;
          horse_id: string;
          name: string;
          role: EmergencyContactRole;
          phone: string;
          email: string | null;
          notes: string | null;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          horse_id: string;
          name: string;
          role: EmergencyContactRole;
          phone: string;
          email?: string | null;
          notes?: string | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          horse_id?: string;
          name?: string;
          role?: EmergencyContactRole;
          phone?: string;
          email?: string | null;
          notes?: string | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      horse_alerts: {
        Row: {
          id: string;
          horse_id: string;
          business_id: string;
          type: AlertType;
          title: string;
          description: string | null;
          priority: AlertPriority;
          is_active: boolean;
          expires_at: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          horse_id: string;
          business_id: string;
          type: AlertType;
          title: string;
          description?: string | null;
          priority?: AlertPriority;
          is_active?: boolean;
          expires_at: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          horse_id?: string;
          business_id?: string;
          type?: AlertType;
          title?: string;
          description?: string | null;
          priority?: AlertPriority;
          is_active?: boolean;
          expires_at?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      care_logs: {
        Row: {
          id: string;
          business_id: string;
          horse_id: string;
          type: CareActivityType;
          logged_at: string;
          logged_date: string;
          details: Json;
          notes: string | null;
          photos: string[];
          logged_by: string | null;
          logged_by_name: string | null;
          year_month: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          horse_id: string;
          type: CareActivityType;
          logged_at?: string;
          logged_date?: string;
          details?: Json;
          notes?: string | null;
          photos?: string[];
          logged_by?: string | null;
          logged_by_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          horse_id?: string;
          type?: CareActivityType;
          logged_at?: string;
          logged_date?: string;
          details?: Json;
          notes?: string | null;
          photos?: string[];
          logged_by?: string | null;
          logged_by_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reminders: {
        Row: {
          id: string;
          business_id: string;
          horse_id: string | null;
          title: string;
          type: ReminderType;
          description: string | null;
          due_date: string;
          due_time: string | null;
          priority: PriorityLevel;
          repeat_interval: RepeatInterval;
          lead_time_minutes: number;
          assigned_to: string | null;
          assigned_to_name: string | null;
          completed: boolean;
          completed_at: string | null;
          completed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          horse_id?: string | null;
          title: string;
          type: ReminderType;
          description?: string | null;
          due_date: string;
          due_time?: string | null;
          priority?: PriorityLevel;
          repeat_interval?: RepeatInterval;
          lead_time_minutes?: number;
          assigned_to?: string | null;
          assigned_to_name?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          completed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          horse_id?: string | null;
          title?: string;
          type?: ReminderType;
          description?: string | null;
          due_date?: string;
          due_time?: string | null;
          priority?: PriorityLevel;
          repeat_interval?: RepeatInterval;
          lead_time_minutes?: number;
          assigned_to?: string | null;
          assigned_to_name?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          completed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      calendar_types: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          color: string;
          is_default: boolean;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          color?: string;
          is_default?: boolean;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          color?: string;
          is_default?: boolean;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      calendar_events: {
        Row: {
          id: string;
          business_id: string;
          horse_id: string | null;
          calendar_type_id: string | null;
          title: string;
          description: string | null;
          type: CalendarEventType;
          event_date: string;
          start_time: string | null;
          end_time: string | null;
          all_day: boolean;
          location: string | null;
          is_recurring: boolean;
          recurrence_rule: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          horse_id?: string | null;
          calendar_type_id?: string | null;
          title: string;
          description?: string | null;
          type?: CalendarEventType;
          event_date: string;
          start_time?: string | null;
          end_time?: string | null;
          all_day?: boolean;
          location?: string | null;
          is_recurring?: boolean;
          recurrence_rule?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          horse_id?: string | null;
          calendar_type_id?: string | null;
          title?: string;
          description?: string | null;
          type?: CalendarEventType;
          event_date?: string;
          start_time?: string | null;
          end_time?: string | null;
          all_day?: boolean;
          location?: string | null;
          is_recurring?: boolean;
          recurrence_rule?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          business_id: string;
          horse_id: string | null;
          name: string;
          category: DocumentCategory;
          file_path: string;
          file_name: string;
          file_size: number | null;
          mime_type: string | null;
          expiration_date: string | null;
          notes: string | null;
          tags: string[];
          uploaded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          horse_id?: string | null;
          name: string;
          category?: DocumentCategory;
          file_path: string;
          file_name: string;
          file_size?: number | null;
          mime_type?: string | null;
          expiration_date?: string | null;
          notes?: string | null;
          tags?: string[];
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          horse_id?: string | null;
          name?: string;
          category?: DocumentCategory;
          file_path?: string;
          file_name?: string;
          file_size?: number | null;
          mime_type?: string | null;
          expiration_date?: string | null;
          notes?: string | null;
          tags?: string[];
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      direct_messages: {
        Row: {
          id: string;
          business_id: string;
          sender_id: string;
          recipient_id: string;
          horse_id: string | null;
          subject: string | null;
          message: string;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
          deleted_by_sender: boolean;
          deleted_by_recipient: boolean;
        };
        Insert: {
          id?: string;
          business_id: string;
          sender_id: string;
          recipient_id: string;
          horse_id?: string | null;
          subject?: string | null;
          message: string;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
          deleted_by_sender?: boolean;
          deleted_by_recipient?: boolean;
        };
        Update: {
          id?: string;
          business_id?: string;
          sender_id?: string;
          recipient_id?: string;
          horse_id?: string | null;
          subject?: string | null;
          message?: string;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
          deleted_by_sender?: boolean;
          deleted_by_recipient?: boolean;
        };
      };
      activity_log: {
        Row: {
          id: string;
          business_id: string;
          entity_type: string;
          entity_id: string;
          action: string;
          user_id: string | null;
          user_name: string | null;
          old_values: Json | null;
          new_values: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          entity_type: string;
          entity_id: string;
          action: string;
          user_id?: string | null;
          user_name?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          entity_type?: string;
          entity_id?: string;
          action?: string;
          user_id?: string | null;
          user_name?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          created_at?: string;
        };
      };
      notification_queue: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          data: Json;
          scheduled_for: string;
          sent: boolean;
          sent_at: string | null;
          error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body: string;
          data?: Json;
          scheduled_for?: string;
          sent?: boolean;
          sent_at?: string | null;
          error?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          body?: string;
          data?: Json;
          scheduled_for?: string;
          sent?: boolean;
          sent_at?: string | null;
          error?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_business_with_owner: {
        Args: { p_name: string; p_timezone?: string };
        Returns: string;
      };
      join_business_by_code: {
        Args: { p_code: string; p_role?: UserRole };
        Returns: Json;
      };
      accept_team_invite: {
        Args: { p_token: string };
        Returns: Json;
      };
      complete_reminder: {
        Args: { p_reminder_id: string; p_notes?: string };
        Returns: Json;
      };
      get_horse_care_stats: {
        Args: { p_horse_id: string; p_days?: number };
        Returns: Json;
      };
      get_business_stats: {
        Args: { p_business_id: string };
        Returns: Json;
      };
      search_horses: {
        Args: { p_business_id: string; p_query: string };
        Returns: {
          id: string;
          name: string;
          breed: string | null;
          stall_location: string | null;
          photo_url: string | null;
        }[];
      };
    };
    Enums: {
      user_role: UserRole;
      user_mode: UserMode;
      subscription_tier: SubscriptionTier;
      horse_gender: HorseGender;
      care_activity_type: CareActivityType;
      reminder_type: ReminderType;
      repeat_interval: RepeatInterval;
      priority_level: PriorityLevel;
      document_category: DocumentCategory;
      calendar_event_type: CalendarEventType;
      emergency_contact_role: EmergencyContactRole;
      alert_type: AlertType;
      alert_priority: AlertPriority;
      invite_status: InviteStatus;
      member_status: MemberStatus;
    };
  };
}

// Convenience type aliases for table rows
export type Business = Database['public']['Tables']['businesses']['Row'];
export type BusinessInsert = Database['public']['Tables']['businesses']['Insert'];
export type BusinessUpdate = Database['public']['Tables']['businesses']['Update'];

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

export type BusinessMember = Database['public']['Tables']['business_members']['Row'];
export type BusinessMemberInsert = Database['public']['Tables']['business_members']['Insert'];
export type BusinessMemberUpdate = Database['public']['Tables']['business_members']['Update'];

export type TeamInvite = Database['public']['Tables']['team_invites']['Row'];
export type TeamInviteInsert = Database['public']['Tables']['team_invites']['Insert'];
export type TeamInviteUpdate = Database['public']['Tables']['team_invites']['Update'];

export type Horse = Database['public']['Tables']['horses']['Row'];
export type HorseInsert = Database['public']['Tables']['horses']['Insert'];
export type HorseUpdate = Database['public']['Tables']['horses']['Update'];

export type HorseEmergencyContact = Database['public']['Tables']['horse_emergency_contacts']['Row'];
export type HorseEmergencyContactInsert = Database['public']['Tables']['horse_emergency_contacts']['Insert'];
export type HorseEmergencyContactUpdate = Database['public']['Tables']['horse_emergency_contacts']['Update'];

export type HorseAlert = Database['public']['Tables']['horse_alerts']['Row'];
export type HorseAlertInsert = Database['public']['Tables']['horse_alerts']['Insert'];
export type HorseAlertUpdate = Database['public']['Tables']['horse_alerts']['Update'];

export type CareLog = Database['public']['Tables']['care_logs']['Row'];
export type CareLogInsert = Database['public']['Tables']['care_logs']['Insert'];
export type CareLogUpdate = Database['public']['Tables']['care_logs']['Update'];

export type Reminder = Database['public']['Tables']['reminders']['Row'];
export type ReminderInsert = Database['public']['Tables']['reminders']['Insert'];
export type ReminderUpdate = Database['public']['Tables']['reminders']['Update'];

export type CalendarType = Database['public']['Tables']['calendar_types']['Row'];
export type CalendarTypeInsert = Database['public']['Tables']['calendar_types']['Insert'];
export type CalendarTypeUpdate = Database['public']['Tables']['calendar_types']['Update'];

export type CalendarEvent = Database['public']['Tables']['calendar_events']['Row'];
export type CalendarEventInsert = Database['public']['Tables']['calendar_events']['Insert'];
export type CalendarEventUpdate = Database['public']['Tables']['calendar_events']['Update'];

export type Document = Database['public']['Tables']['documents']['Row'];
export type DocumentInsert = Database['public']['Tables']['documents']['Insert'];
export type DocumentUpdate = Database['public']['Tables']['documents']['Update'];

export type DirectMessage = Database['public']['Tables']['direct_messages']['Row'];
export type DirectMessageInsert = Database['public']['Tables']['direct_messages']['Insert'];
export type DirectMessageUpdate = Database['public']['Tables']['direct_messages']['Update'];

export type ActivityLog = Database['public']['Tables']['activity_log']['Row'];
export type NotificationQueue = Database['public']['Tables']['notification_queue']['Row'];
