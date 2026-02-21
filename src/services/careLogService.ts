import { supabase } from '../lib/supabase';
import type {
  CareLog,
  CareLogInsert,
  CareLogUpdate,
  CareActivityType,
} from '../types/database';
import type { ServiceResult } from './businessService';

export interface CareLogFilters {
  horseId?: string;
  type?: CareActivityType | CareActivityType[];
  startDate?: string;
  endDate?: string;
  loggedBy?: string;
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

/**
 * Care Log Service
 * Handles all care log CRUD operations with filtering and pagination
 */
export const careLogService = {
  /**
   * Get care logs with filters and pagination
   */
  async getAll(
    businessId: string,
    filters?: CareLogFilters,
    pagination?: PaginationOptions
  ): Promise<ServiceResult<{ data: CareLog[]; count: number }>> {
    const page = pagination?.page || 1;
    const pageSize = pagination?.pageSize || 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('care_logs')
      .select('*, horse:horses(id, name, photo_url)', { count: 'exact' })
      .eq('business_id', businessId);

    // Apply filters
    if (filters?.horseId) {
      query = query.eq('horse_id', filters.horseId);
    }

    if (filters?.type) {
      if (Array.isArray(filters.type)) {
        query = query.in('type', filters.type);
      } else {
        query = query.eq('type', filters.type);
      }
    }

    if (filters?.startDate) {
      query = query.gte('logged_date', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('logged_date', filters.endDate);
    }

    if (filters?.loggedBy) {
      query = query.eq('logged_by', filters.loggedBy);
    }

    // Order and paginate
    query = query
      .order('logged_at', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return {
      data: {
        data: data || [],
        count: count || 0,
      },
      error: null,
    };
  },

  /**
   * Get care logs for today
   */
  async getToday(businessId: string): Promise<ServiceResult<CareLog[]>> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('care_logs')
      .select('*, horse:horses(id, name, photo_url)')
      .eq('business_id', businessId)
      .eq('logged_date', today)
      .order('logged_at', { ascending: false });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Get care logs for a specific horse
   */
  async getByHorse(
    horseId: string,
    limit?: number
  ): Promise<ServiceResult<CareLog[]>> {
    let query = supabase
      .from('care_logs')
      .select('*')
      .eq('horse_id', horseId)
      .order('logged_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Get a single care log by ID
   */
  async getById(id: string): Promise<ServiceResult<CareLog>> {
    const { data, error } = await supabase
      .from('care_logs')
      .select('*, horse:horses(id, name, photo_url)')
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Create a new care log
   */
  async create(log: CareLogInsert): Promise<ServiceResult<CareLog>> {
    const { data, error } = await supabase
      .from('care_logs')
      .insert(log)
      .select('*, horse:horses(id, name, photo_url)')
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Update a care log
   */
  async update(id: string, updates: CareLogUpdate): Promise<ServiceResult<CareLog>> {
    const { data, error } = await supabase
      .from('care_logs')
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
   * Delete a care log
   */
  async delete(id: string): Promise<ServiceResult<null>> {
    const { error } = await supabase
      .from('care_logs')
      .delete()
      .eq('id', id);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: null, error: null };
  },

  /**
   * Get care statistics for a horse
   */
  async getHorseCareStats(
    horseId: string,
    days?: number
  ): Promise<ServiceResult<{
    total_logs: number;
    by_type: Record<string, number>;
    by_day: Array<{ date: string; count: number }>;
  }>> {
    const { data, error } = await supabase.rpc('get_horse_care_stats', {
      p_horse_id: horseId,
      p_days: days || 30,
    });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Get recent activity feed (last N care logs across all horses)
   */
  async getRecentActivity(
    businessId: string,
    limit?: number
  ): Promise<ServiceResult<CareLog[]>> {
    const { data, error } = await supabase
      .from('care_logs')
      .select(`
        *,
        horse:horses(id, name, photo_url)
      `)
      .eq('business_id', businessId)
      .order('logged_at', { ascending: false })
      .limit(limit || 20);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Get care logs by date range (for reports)
   */
  async getByDateRange(
    businessId: string,
    startDate: string,
    endDate: string,
    horseId?: string
  ): Promise<ServiceResult<CareLog[]>> {
    let query = supabase
      .from('care_logs')
      .select('*, horse:horses(id, name)')
      .eq('business_id', businessId)
      .gte('logged_date', startDate)
      .lte('logged_date', endDate)
      .order('logged_date', { ascending: true })
      .order('logged_at', { ascending: true });

    if (horseId) {
      query = query.eq('horse_id', horseId);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Get care log summary by type for a date range
   */
  async getSummaryByType(
    businessId: string,
    startDate: string,
    endDate: string
  ): Promise<ServiceResult<Record<CareActivityType, number>>> {
    const { data, error } = await supabase
      .from('care_logs')
      .select('type')
      .eq('business_id', businessId)
      .gte('logged_date', startDate)
      .lte('logged_date', endDate);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    // Count by type
    const summary = (data || []).reduce((acc: Record<string, number>, log: any) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { data: summary, error: null };
  },
};

export default careLogService;
