export interface Horse {
  id: string;
  name: string;
  nickname?: string;
  breed: string;
  color: string;
  gender: 'mare' | 'gelding' | 'stallion';
  birthDate: string;
  photo?: string;
  stallLocation?: string;
  feedingSchedule: FeedingSchedule;
  emergencyContacts: EmergencyContact[];
  allergies: string[];
  medications: string[];
  specialNeeds?: string;
  notes?: string;
  alerts?: number;
  alertSummary?: string;
  createdAt: string;
}

export interface FeedingSchedule {
  feedingsPerDay: number;
  feedTimes: string[];
  feedType?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: 'veterinarian' | 'farrier' | 'barn_manager' | 'owner' | 'other';
  phone: string;
  email?: string;
}

export interface CareLog {
  id: string;
  horseId: string;
  type: CareLogType;
  date: string;
  time: string;
  details: Record<string, any>;
  notes?: string;
  photos?: string[];
  loggedBy: string;
  createdAt: string;
}

export type CareLogType =
  | 'feeding' | 'turnout' | 'blanketing' | 'medication' | 'exercise'
  | 'grooming' | 'health_check' | 'farrier' | 'vet_visit' | 'other';

export type ActivityType = CareLogType;

export interface Reminder {
  id: string;
  horseId: string;
  title: string;
  type: ReminderType;
  dueDate: string;
  dueTime?: string;
  repeat: RepeatInterval;
  leadReminder: LeadTime;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  completed: boolean;
  completedAt?: string;
  assignedTo?: string;
  createdAt: string;
}

export type ReminderType =
  | 'vaccination' | 'farrier' | 'vet_checkup' | 'dental' | 'deworming'
  | 'feeding' | 'medication' | 'exercise' | 'grooming' | 'supplement'
  | 'coggins' | 'other';

export type RepeatInterval =
  | 'never' | 'daily' | 'weekly' | 'biweekly' | 'monthly'
  | 'quarterly' | 'biannually' | 'yearly';

export type LeadTime = 'none' | '15min' | '1hour' | '1day' | '3days' | '1week' | '2weeks';

export interface Document {
  id: string;
  horseId: string;
  name: string;
  category: DocumentCategory;
  fileUrl?: string;
  expirationDate?: string;
  notes?: string;
  uploadedAt: string;
}

export type DocumentCategory =
  | 'health_records' | 'registration' | 'contracts' | 'insurance'
  | 'photos' | 'coggins' | 'other';

export type EventType = 'vet_visit' | 'farrier' | 'lesson' | 'show' | 'vaccination' | 'other';

export type CalendarTypeId = 'all' | 'lessons' | 'shifts' | 'meetings' | 'horse_care' | 'shows' | 'custom';

export interface CalendarType {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isDefault?: boolean;
  isVisible: boolean;
}

export interface CalendarEvent {
  id: string;
  horseId: string;
  title: string;
  type: EventType;
  date: string;
  startTime?: string;
  endTime?: string;
  allDay: boolean;
  location?: string;
  notes?: string;
  reminderId?: string;
  calendarId?: string;
}

export type HorseAlertType = 'diet_change' | 'medication_change' | 'health_concern' | 'schedule_change' | 'other';

export interface HorseAlert {
  id: string;
  horseId: string;
  type: HorseAlertType;
  title: string;
  message: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: ProductCategory;
  rating: number;
  reviewCount: number;
  badge?: 'new' | 'sale' | 'bestseller';
  inStock: boolean;
}

export type ProductCategory =
  | 'blankets' | 'fly_protection' | 'supplements' | 'grooming'
  | 'tack' | 'health' | 'stable' | 'apparel';

export type UserRole = 'owner' | 'manager' | 'staff' | 'volunteer' | 'boarder';

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  horseId?: string;
  subject: string;
  message: string;
  createdAt: string;
  readAt?: string;
  isRead: boolean;
}

export type SubscriptionTier = 'free' | 'team' | 'business';
export type UserMode = 'standard' | 'trainer' | 'staff' | 'boarder';

export interface LinkedBusiness {
  id: string;
  name: string;
  code: string;
  role: UserRole;
  linkedAt: string;
  isActive: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  joinedAt: string;
  invitedBy?: string;
  status: 'active' | 'pending' | 'inactive';
  assignedHorses?: string[];
}

export interface Subscription {
  tier: SubscriptionTier;
  maxUsers: number;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  startDate?: string;
  nextBillingDate?: string;
}

export interface TeamInvite {
  id: string;
  business_id: string;
  email: string;
  name: string | null;
  role: UserRole;
  assigned_horse_ids: string[];
  invite_token: string;
  status: 'pending' | 'accepted' | 'expired';
  invited_by: string | null;
  invited_at: string;
  expires_at: string;
  accepted_at?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  barnName?: string;
  location?: string;
  timezone: string;
  subscription: Subscription;
  preferences: UserPreferences;
  userMode: UserMode;
  businessCode?: string;
  linkedBusinesses: LinkedBusiness[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  defaultReminderLead: LeadTime;
}
