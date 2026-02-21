import { supabase } from '../lib/supabase';
import type {
  CalendarType,
  CalendarTypeInsert,
  CalendarTypeUpdate,
  CalendarEvent,
  CalendarEventInsert,
  CalendarEventUpdate,
} from '../types/database';
import type { ServiceResult } from './businessService';

/**
 * Calendar Service
 * Handles calendar types and events
 */
export const calendarService = {
  // Calendar Types

  /**
   * Get all calendar types for a business
   */
  async getCalendarTypes(businessId: string): Promise<ServiceResult<CalendarType[]>> {
    const { data, error } = await supabase
      .from('calendar_types')
      .select('*')
      .eq('business_id', businessId)
      .order('name', { ascending: true });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Create a calendar type
   */
  async createCalendarType(
    calendarType: CalendarTypeInsert
  ): Promise<ServiceResult<CalendarType>> {
    const { data, error } = await supabase
      .from('calendar_types')
      .insert(calendarType)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Update a calendar type
   */
  async updateCalendarType(
    id: string,
    updates: CalendarTypeUpdate
  ): Promise<ServiceResult<CalendarType>> {
    const { data, error } = await supabase
      .from('calendar_types')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Delete a calendar type
   */
  async deleteCalendarType(id: string): Promise<ServiceResult<null>> {
    const { error } = await supabase
      .from('calendar_types')
      .delete()
      .eq('id', id);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: null, error: null };
  },

  /**
   * Toggle calendar type visibility
   */
  async toggleCalendarVisibility(id: string): Promise<ServiceResult<CalendarType>> {
    // First get current state
    const { data: current, error: fetchError } = await supabase
      .from('calendar_types')
      .select('is_visible')
      .eq('id', id)
      .single();

    if (fetchError) {
      return { data: null, error: new Error(fetchError.message) };
    }

    // Toggle
    const { data, error } = await supabase
      .from('calendar_types')
      .update({ is_visible: !current.is_visible })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  // Calendar Events

  /**
   * Get events for a date range
   */
  async getEvents(
    businessId: string,
    startDate: string,
    endDate: string,
    calendarTypeId?: string
  ): Promise<ServiceResult<CalendarEvent[]>> {
    let query = supabase
      .from('calendar_events')
      .select(`
        *,
        horse:horses(id, name),
        calendar_type:calendar_types(id, name, color)
      `)
      .eq('business_id', businessId)
      .gte('event_date', startDate)
      .lte('event_date', endDate);

    if (calendarTypeId) {
      query = query.eq('calendar_type_id', calendarTypeId);
    }

    query = query.order('event_date', { ascending: true });

    const { data, error } = await query;

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Get events for a specific date
   */
  async getEventsForDate(
    businessId: string,
    date: string
  ): Promise<ServiceResult<CalendarEvent[]>> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select(`
        *,
        horse:horses(id, name, photo_url),
        calendar_type:calendar_types(id, name, color)
      `)
      .eq('business_id', businessId)
      .eq('event_date', date)
      .order('start_time', { ascending: true, nullsFirst: true });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Get events for a horse
   */
  async getEventsForHorse(
    horseId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ServiceResult<CalendarEvent[]>> {
    let query = supabase
      .from('calendar_events')
      .select(`
        *,
        calendar_type:calendar_types(id, name, color)
      `)
      .eq('horse_id', horseId);

    if (startDate) {
      query = query.gte('event_date', startDate);
    }

    if (endDate) {
      query = query.lte('event_date', endDate);
    }

    query = query.order('event_date', { ascending: true });

    const { data, error } = await query;

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Get event by ID
   */
  async getEventById(id: string): Promise<ServiceResult<CalendarEvent>> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select(`
        *,
        horse:horses(id, name, photo_url),
        calendar_type:calendar_types(id, name, color)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Create an event
   */
  async createEvent(event: CalendarEventInsert): Promise<ServiceResult<CalendarEvent>> {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert(event)
      .select(`
        *,
        horse:horses(id, name, photo_url),
        calendar_type:calendar_types(id, name, color)
      `)
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Update an event
   */
  async updateEvent(
    id: string,
    updates: CalendarEventUpdate
  ): Promise<ServiceResult<CalendarEvent>> {
    const { data, error } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        horse:horses(id, name, photo_url),
        calendar_type:calendar_types(id, name, color)
      `)
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Delete an event
   */
  async deleteEvent(id: string): Promise<ServiceResult<null>> {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: null, error: null };
  },

  /**
   * Get today's events
   */
  async getTodaysEvents(businessId: string): Promise<ServiceResult<CalendarEvent[]>> {
    const today = new Date().toISOString().split('T')[0];
    return this.getEventsForDate(businessId, today);
  },

  /**
   * Get upcoming events (next N days)
   */
  async getUpcomingEvents(
    businessId: string,
    days: number = 7
  ): Promise<ServiceResult<CalendarEvent[]>> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return this.getEvents(
      businessId,
      today.toISOString().split('T')[0],
      futureDate.toISOString().split('T')[0]
    );
  },
};

export default calendarService;
