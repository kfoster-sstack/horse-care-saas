import { supabase } from '../lib/supabase';
import type {
  Business,
  BusinessInsert,
  BusinessUpdate,
  BusinessMember,
  TeamInvite,
  TeamInviteInsert,
  UserRole,
} from '../types/database';

export interface ServiceResult<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Business Service
 * Handles all business-related CRUD operations
 */
export const businessService = {
  /**
   * Create a new business (using the stored function)
   */
  async create(name: string, timezone?: string): Promise<ServiceResult<string>> {
    const { data, error } = await supabase.rpc('create_business_with_owner', {
      p_name: name,
      p_timezone: timezone || 'America/New_York',
    });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Get business by ID
   */
  async getById(id: string): Promise<ServiceResult<Business>> {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Get business by code
   */
  async getByCode(code: string): Promise<ServiceResult<Business>> {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Update business
   */
  async update(id: string, updates: BusinessUpdate): Promise<ServiceResult<Business>> {
    const { data, error } = await supabase
      .from('businesses')
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
   * Join a business by code
   */
  async joinByCode(code: string, role?: UserRole): Promise<ServiceResult<{
    success: boolean;
    business_id?: string;
    business_name?: string;
    error?: string;
  }>> {
    const { data, error } = await supabase.rpc('join_business_by_code', {
      p_code: code.toUpperCase(),
      p_role: role || 'staff',
    });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Get business statistics
   */
  async getStats(businessId: string): Promise<ServiceResult<{
    horses: number;
    team_members: number;
    pending_reminders: number;
    todays_events: number;
    active_alerts: number;
    care_logs_today: number;
    expiring_documents: number;
  }>> {
    const { data, error } = await supabase.rpc('get_business_stats', {
      p_business_id: businessId,
    });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Get all team members for a business
   */
  async getTeamMembers(businessId: string): Promise<ServiceResult<BusinessMember[]>> {
    const { data, error } = await supabase
      .from('business_members')
      .select(`
        *,
        user_profile:user_profiles(id, name, email, avatar_url)
      `)
      .eq('business_id', businessId)
      .order('joined_at', { ascending: true });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Update team member role
   */
  async updateMemberRole(
    memberId: string,
    role: UserRole
  ): Promise<ServiceResult<BusinessMember>> {
    const { data, error } = await supabase
      .from('business_members')
      .update({ role })
      .eq('id', memberId)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Remove team member
   */
  async removeMember(memberId: string): Promise<ServiceResult<null>> {
    const { error } = await supabase
      .from('business_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: null, error: null };
  },

  /**
   * Get pending invites for a business
   */
  async getPendingInvites(businessId: string): Promise<ServiceResult<TeamInvite[]>> {
    const { data, error } = await supabase
      .from('team_invites')
      .select('*')
      .eq('business_id', businessId)
      .eq('status', 'pending')
      .order('invited_at', { ascending: false });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Create team invite
   */
  async createInvite(invite: TeamInviteInsert): Promise<ServiceResult<TeamInvite>> {
    const { data, error } = await supabase
      .from('team_invites')
      .insert(invite)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Accept team invite
   */
  async acceptInvite(token: string): Promise<ServiceResult<{
    success: boolean;
    business_id?: string;
    role?: string;
    error?: string;
  }>> {
    const { data, error } = await supabase.rpc('accept_team_invite', {
      p_token: token,
    });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  },

  /**
   * Cancel team invite
   */
  async cancelInvite(inviteId: string): Promise<ServiceResult<null>> {
    const { error } = await supabase
      .from('team_invites')
      .update({ status: 'cancelled' })
      .eq('id', inviteId);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: null, error: null };
  },
};

export default businessService;
