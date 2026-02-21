import { supabase } from '../lib/supabase';
import type {
  Horse,
  HorseInsert,
  HorseUpdate,
  HorseEmergencyContact,
  HorseEmergencyContactInsert,
  HorseAlert,
  HorseAlertInsert,
  HorseAlertUpdate,
} from '../types/database';
import type { ServiceResult } from './businessService';

/**
 * Horse Service
 * Handles all horse-related CRUD operations
 */
export const horseService = {
  /**
   * Get all horses for a business
   */
  async getAll(businessId: string): Promise<ServiceResult<Horse[]>> {
    const { data, error } = await supabase
      .from('horses')
      .select('*')
      .eq('business_id', businessId)
      .is('deleted_at', null)
      .order('name', { ascending: true });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Get horse by ID with related data
   */
  async getById(id: string): Promise<ServiceResult<Horse & {
    emergency_contacts: HorseEmergencyContact[];
    active_alerts: HorseAlert[];
  }>> {
    const { data: horse, error: horseError } = await supabase
      .from('horses')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (horseError) {
      return { data: null, error: new Error(horseError.message) };
    }

    // Fetch emergency contacts
    const { data: contacts } = await supabase
      .from('horse_emergency_contacts')
      .select('*')
      .eq('horse_id', id)
      .order('is_primary', { ascending: false });

    // Fetch active alerts
    const { data: alerts } = await supabase
      .from('horse_alerts')
      .select('*')
      .eq('horse_id', id)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('priority', { ascending: false });

    return {
      data: {
        ...horse,
        emergency_contacts: contacts || [],
        active_alerts: alerts || [],
      },
      error: null,
    };
  },

  /**
   * Create a new horse
   */
  async create(horse: HorseInsert): Promise<ServiceResult<Horse>> {
    const { data, error } = await supabase
      .from('horses')
      .insert(horse)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Update a horse
   */
  async update(id: string, updates: HorseUpdate): Promise<ServiceResult<Horse>> {
    const { data, error } = await supabase
      .from('horses')
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
   * Soft delete a horse
   */
  async delete(id: string): Promise<ServiceResult<null>> {
    const { error } = await supabase
      .from('horses')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: null, error: null };
  },

  /**
   * Search horses by name
   */
  async search(businessId: string, query: string): Promise<ServiceResult<Horse[]>> {
    const { data, error } = await supabase.rpc('search_horses', {
      p_business_id: businessId,
      p_query: query,
    });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  // Emergency Contacts

  /**
   * Get emergency contacts for a horse
   */
  async getEmergencyContacts(
    horseId: string
  ): Promise<ServiceResult<HorseEmergencyContact[]>> {
    const { data, error } = await supabase
      .from('horse_emergency_contacts')
      .select('*')
      .eq('horse_id', horseId)
      .order('is_primary', { ascending: false });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Add emergency contact
   */
  async addEmergencyContact(
    contact: HorseEmergencyContactInsert
  ): Promise<ServiceResult<HorseEmergencyContact>> {
    const { data, error } = await supabase
      .from('horse_emergency_contacts')
      .insert(contact)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Update emergency contact
   */
  async updateEmergencyContact(
    id: string,
    updates: Partial<HorseEmergencyContact>
  ): Promise<ServiceResult<HorseEmergencyContact>> {
    const { data, error } = await supabase
      .from('horse_emergency_contacts')
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
   * Delete emergency contact
   */
  async deleteEmergencyContact(id: string): Promise<ServiceResult<null>> {
    const { error } = await supabase
      .from('horse_emergency_contacts')
      .delete()
      .eq('id', id);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: null, error: null };
  },

  // Horse Alerts

  /**
   * Get active alerts for a horse
   */
  async getActiveAlerts(horseId: string): Promise<ServiceResult<HorseAlert[]>> {
    const { data, error } = await supabase
      .from('horse_alerts')
      .select('*')
      .eq('horse_id', horseId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('priority', { ascending: false });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Get all active alerts for a business
   */
  async getAllActiveAlerts(businessId: string): Promise<ServiceResult<HorseAlert[]>> {
    const { data, error } = await supabase
      .from('horse_alerts')
      .select(`
        *,
        horse:horses(id, name, photo_url)
      `)
      .eq('business_id', businessId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('priority', { ascending: false });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Create alert
   */
  async createAlert(alert: HorseAlertInsert): Promise<ServiceResult<HorseAlert>> {
    const { data, error } = await supabase
      .from('horse_alerts')
      .insert(alert)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Update alert
   */
  async updateAlert(
    id: string,
    updates: HorseAlertUpdate
  ): Promise<ServiceResult<HorseAlert>> {
    const { data, error } = await supabase
      .from('horse_alerts')
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
   * Dismiss alert (deactivate)
   */
  async dismissAlert(id: string): Promise<ServiceResult<null>> {
    const { error } = await supabase
      .from('horse_alerts')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: null, error: null };
  },

  /**
   * Delete alert
   */
  async deleteAlert(id: string): Promise<ServiceResult<null>> {
    const { error } = await supabase
      .from('horse_alerts')
      .delete()
      .eq('id', id);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: null, error: null };
  },
};

export default horseService;
