import { supabase } from '../lib/supabase';
import type {
  Reminder,
  ReminderInsert,
  ReminderUpdate,
  ReminderType,
} from '../types/database';
import type { ServiceResult } from './businessService';

export interface ReminderFilters {
  horseId?: string;
  assignedTo?: string;
  type?: ReminderType | ReminderType[];
  completed?: boolean;
  dueBefore?: string;
  dueAfter?: string;
}

/**
 * Reminder Service
 * Handles all reminder CRUD operations
 */
export const reminderService = {
  /**
   * Get all reminders with filters
   */
  async getAll(
    businessId: string,
    filters?: ReminderFilters
  ): Promise<ServiceResult<Reminder[]>> {
    let query = supabase
      .from('reminders')
      .select('*, horse:horses(id, name, photo_url)')
      .eq('business_id', businessId);

    // Apply filters
    if (filters?.horseId) {
      query = query.eq('horse_id', filters.horseId);
    }

    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }

    if (filters?.type) {
      if (Array.isArray(filters.type)) {
        query = query.in('type', filters.type);
      } else {
        query = query.eq('type', filters.type);
      }
    }

    if (filters?.completed !== undefined) {
      query = query.eq('completed', filters.completed);
    }

    if (filters?.dueBefore) {
      query = query.lte('due_date', filters.dueBefore);
    }

    if (filters?.dueAfter) {
      query = query.gte('due_date', filters.dueAfter);
    }

    // Order by due date, then priority
    query = query
      .order('due_date', { ascending: true })
      .order('priority', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Get pending reminders (not completed)
   */
  async getPending(businessId: string): Promise<ServiceResult<Reminder[]>> {
    return this.getAll(businessId, { completed: false });
  },

  /**
   * Get today's reminders
   */
  async getToday(businessId: string): Promise<ServiceResult<Reminder[]>> {
    const today = new Date().toISOString().split('T')[0];

    return this.getAll(businessId, {
      completed: false,
      dueBefore: today,
      dueAfter: today,
    });
  },

  /**
   * Get overdue reminders
   */
  async getOverdue(businessId: string): Promise<ServiceResult<Reminder[]>> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('reminders')
      .select('*, horse:horses(id, name, photo_url)')
      .eq('business_id', businessId)
      .eq('completed', false)
      .lt('due_date', today)
      .order('due_date', { ascending: true });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Get upcoming reminders (next N days)
   */
  async getUpcoming(
    businessId: string,
    days: number = 7
  ): Promise<ServiceResult<Reminder[]>> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const { data, error } = await supabase
      .from('reminders')
      .select('*, horse:horses(id, name, photo_url)')
      .eq('business_id', businessId)
      .eq('completed', false)
      .gte('due_date', today.toISOString().split('T')[0])
      .lte('due_date', futureDate.toISOString().split('T')[0])
      .order('due_date', { ascending: true });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Get reminders assigned to a user
   */
  async getAssignedToUser(
    userId: string,
    completed?: boolean
  ): Promise<ServiceResult<Reminder[]>> {
    let query = supabase
      .from('reminders')
      .select('*, horse:horses(id, name, photo_url, business_id)')
      .eq('assigned_to', userId);

    if (completed !== undefined) {
      query = query.eq('completed', completed);
    }

    query = query.order('due_date', { ascending: true });

    const { data, error } = await query;

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Get reminders for a specific horse
   */
  async getByHorse(
    horseId: string,
    completed?: boolean
  ): Promise<ServiceResult<Reminder[]>> {
    let query = supabase
      .from('reminders')
      .select('*')
      .eq('horse_id', horseId);

    if (completed !== undefined) {
      query = query.eq('completed', completed);
    }

    query = query.order('due_date', { ascending: true });

    const { data, error } = await query;

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Get a single reminder by ID
   */
  async getById(id: string): Promise<ServiceResult<Reminder>> {
    const { data, error } = await supabase
      .from('reminders')
      .select('*, horse:horses(id, name, photo_url)')
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Create a new reminder
   */
  async create(reminder: ReminderInsert): Promise<ServiceResult<Reminder>> {
    const { data, error } = await supabase
      .from('reminders')
      .insert(reminder)
      .select('*, horse:horses(id, name, photo_url)')
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Update a reminder
   */
  async update(id: string, updates: ReminderUpdate): Promise<ServiceResult<Reminder>> {
    const { data, error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', id)
      .select('*, horse:horses(id, name, photo_url)')
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Complete a reminder (using the stored function for recurring support)
   */
  async complete(
    id: string,
    notes?: string
  ): Promise<ServiceResult<{
    success: boolean;
    next_reminder_id?: string;
    next_due_date?: string;
  }>> {
    const { data, error } = await supabase.rpc('complete_reminder', {
      p_reminder_id: id,
      p_notes: notes,
    });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Mark reminder as incomplete (uncomplete)
   */
  async uncomplete(id: string): Promise<ServiceResult<Reminder>> {
    const { data, error } = await supabase
      .from('reminders')
      .update({
        completed: false,
        completed_at: null,
        completed_by: null,
      })
      .eq('id', id)
      .select('*, horse:horses(id, name, photo_url)')
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Delete a reminder
   */
  async delete(id: string): Promise<ServiceResult<null>> {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: null, error: null };
  },

  /**
   * Assign reminder to a user
   */
  async assignTo(
    id: string,
    userId: string,
    userName: string
  ): Promise<ServiceResult<Reminder>> {
    const { data, error } = await supabase
      .from('reminders')
      .update({
        assigned_to: userId,
        assigned_to_name: userName,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Unassign reminder
   */
  async unassign(id: string): Promise<ServiceResult<Reminder>> {
    const { data, error } = await supabase
      .from('reminders')
      .update({
        assigned_to: null,
        assigned_to_name: null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },
};

export default reminderService;
