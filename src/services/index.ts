/**
 * Services Index
 * Export all Supabase services for easy importing
 */

export { businessService } from './businessService';
export { horseService } from './horseService';
export { careLogService } from './careLogService';
export { reminderService } from './reminderService';
export { calendarService } from './calendarService';
export { storageService } from './storageService';

// Re-export types
export type { ServiceResult } from './businessService';
export type { CareLogFilters, PaginationOptions } from './careLogService';
export type { ReminderFilters } from './reminderService';
export type { UploadOptions, FileInfo } from './storageService';
