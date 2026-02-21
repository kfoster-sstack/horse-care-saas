import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Horse,
  CareLog,
  Reminder,
  Document,
  CalendarEvent,
  User,
  TeamMember,
  TeamInvite,
  UserMode,
  LinkedBusiness,
  CalendarType,
  HorseAlert,
  DirectMessage,
} from '../types';
import {
  horseService,
  careLogService,
  reminderService,
  calendarService,
  businessService,
} from '../services';

// Default calendar types
const defaultCalendarTypes: CalendarType[] = [
  { id: 'horse_care', name: 'Horse Care', color: '#8B0000', isDefault: true, isVisible: true },
  { id: 'lessons', name: 'Lessons', color: '#1976D2', isDefault: true, isVisible: true },
  { id: 'shifts', name: 'Shifts', color: '#7B1FA2', isDefault: true, isVisible: true },
  { id: 'meetings', name: 'Business Meetings', color: '#00897B', isDefault: true, isVisible: true },
  { id: 'shows', name: 'Shows & Events', color: '#F57C00', isDefault: true, isVisible: true },
];


interface AppState {
  // Connection State
  isOnline: boolean;
  isAuthenticated: boolean;
  businessId: string | null;
  setOnlineStatus: (online: boolean) => void;
  setAuthenticated: (authenticated: boolean, businessId?: string) => void;

  // Loading & Error State
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // User
  user: User | null;
  setUser: (user: User) => void;

  // Horses
  horses: Horse[];
  addHorse: (horse: Horse) => void;
  updateHorse: (id: string, updates: Partial<Horse>) => void;
  deleteHorse: (id: string) => void;
  fetchHorses: () => Promise<void>;

  // Care Logs
  careLogs: CareLog[];
  addCareLog: (log: CareLog) => void;
  updateCareLog: (id: string, updates: Partial<CareLog>) => void;
  deleteCareLog: (id: string) => void;
  fetchCareLogs: (horseId?: string) => Promise<void>;

  // Reminders
  reminders: Reminder[];
  addReminder: (reminder: Reminder) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  completeReminder: (id: string) => void;
  fetchReminders: () => Promise<void>;

  // Documents
  documents: Document[];
  addDocument: (doc: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;

  // Calendar Events
  events: CalendarEvent[];
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  fetchEvents: (startDate?: string, endDate?: string) => Promise<void>;

  // Team Management
  teamMembers: TeamMember[];
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  removeTeamMember: (id: string) => void;
  fetchTeamMembers: () => Promise<void>;

  // Team Invites
  teamInvites: TeamInvite[];
  inviteTeamMember: (invite: TeamInvite) => void;
  updateInvite: (id: string, updates: Partial<TeamInvite>) => void;
  deleteInvite: (id: string) => void;

  // Subscription
  updateSubscription: (updates: Partial<User['subscription']>) => void;
  canInviteMoreMembers: () => boolean;
  getMaxUsers: () => number;

  // UI State
  selectedHorseId: string | null;
  setSelectedHorseId: (id: string | null) => void;
  selectedCalendarId: string;
  setSelectedCalendarId: (id: string) => void;

  // Calendar Types
  calendarTypes: CalendarType[];
  addCalendarType: (calendarType: CalendarType) => void;
  updateCalendarType: (id: string, updates: Partial<CalendarType>) => void;
  deleteCalendarType: (id: string) => void;
  toggleCalendarVisibility: (id: string) => void;
  fetchCalendarTypes: () => Promise<void>;

  // Horse Alerts
  horseAlerts: HorseAlert[];
  addHorseAlert: (alert: HorseAlert) => void;
  updateHorseAlert: (id: string, updates: Partial<HorseAlert>) => void;
  deleteHorseAlert: (id: string) => void;
  getActiveAlertsForHorse: (horseId: string) => HorseAlert[];
  fetchHorseAlerts: () => Promise<void>;

  // Direct Messages
  messages: DirectMessage[];
  addMessage: (message: DirectMessage) => void;
  markMessageAsRead: (id: string) => void;
  deleteMessage: (id: string) => void;
  getUnreadMessageCount: () => number;

  // Weather location
  weatherLocation: string | null;
  setWeatherLocation: (location: string | null) => void;

  // User Mode Management
  setUserMode: (mode: UserMode) => void;
  addLinkedBusiness: (business: LinkedBusiness) => void;
  removeLinkedBusiness: (businessId: string) => void;
  setActiveBusiness: (businessId: string) => void;
  getActiveBusiness: () => LinkedBusiness | null;
  isOwnerMode: () => boolean;
  isTrainerMode: () => boolean;
  isStaffMode: () => boolean;
  isBoarderMode: () => boolean;

  // Data Sync
  syncAllData: () => Promise<void>;
  clearLocalData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Connection State
      isOnline: true,
      isAuthenticated: false,
      businessId: null,
      setOnlineStatus: (online) => set({ isOnline: online }),
      setAuthenticated: (authenticated, businessId) =>
        set({ isAuthenticated: authenticated, businessId: businessId || null }),

      // Loading & Error State
      loading: false,
      error: null,
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Initialize with empty state - data comes from Supabase
      user: null,
      horses: [],
      careLogs: [],
      reminders: [],
      documents: [],
      events: [],
      teamMembers: [],
      teamInvites: [],
      selectedHorseId: null,
      selectedCalendarId: 'all',
      calendarTypes: defaultCalendarTypes,
      horseAlerts: [],
      messages: [],
      weatherLocation: null,

      // User actions
      setUser: (user) => set({ user }),

      // Horse actions with Supabase sync
      addHorse: (horse) => {
        // Optimistic update
        set((state) => ({ horses: [...state.horses, horse] }));

        // Sync to Supabase if online
        const { isOnline, isAuthenticated, businessId } = get();
        if (isOnline && isAuthenticated && businessId) {
          horseService
            .create({
              ...horse,
              business_id: businessId,
            } as any)
            .then(({ data, error }) => {
              if (error) {
                console.error('Failed to sync horse:', error);
                set({ error: error.message });
              } else if (data) {
                // Update with server ID
                set((state) => ({
                  horses: state.horses.map((h) =>
                    h.id === horse.id ? { ...h, id: data.id } : h
                  ),
                }));
              }
            });
        }
      },

      updateHorse: (id, updates) => {
        // Optimistic update
        set((state) => ({
          horses: state.horses.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        }));

        // Sync to Supabase
        const { isOnline, isAuthenticated } = get();
        if (isOnline && isAuthenticated) {
          horseService.update(id, updates as any).catch((error) => {
            console.error('Failed to update horse:', error);
          });
        }
      },

      deleteHorse: (id) => {
        // Optimistic update
        set((state) => ({
          horses: state.horses.filter((h) => h.id !== id),
        }));

        // Sync to Supabase
        const { isOnline, isAuthenticated } = get();
        if (isOnline && isAuthenticated) {
          horseService.delete(id).catch((error) => {
            console.error('Failed to delete horse:', error);
          });
        }
      },

      fetchHorses: async () => {
        const { isOnline, isAuthenticated, businessId } = get();
        if (!isOnline || !isAuthenticated || !businessId) return;

        set({ loading: true, error: null });
        const { data, error } = await horseService.getAll(businessId);

        if (error) {
          set({ error: error.message, loading: false });
        } else if (data) {
          // Map Supabase data to app types
          const horses: Horse[] = data.map((h) => ({
            id: h.id,
            name: h.name,
            breed: h.breed || '',
            color: h.color || '',
            gender: h.gender as Horse['gender'],
            birthDate: h.birth_date || '',
            stallLocation: h.stall_location || '',
            photo: h.photo_url || undefined,
            feedingSchedule: (h.feeding_schedule as unknown as Horse['feedingSchedule']) || {
              feedingsPerDay: 2,
              feedTimes: ['07:00', '18:00'],
            },
            emergencyContacts: [],
            allergies: h.allergies || [],
            medications: h.medications || [],
            specialNeeds: h.special_needs || undefined,
            notes: h.notes || undefined,
            createdAt: h.created_at,
          }));
          set({ horses, loading: false });
        }
      },

      // Care Log actions with Supabase sync
      addCareLog: (log) => {
        set((state) => ({ careLogs: [log, ...state.careLogs] }));

        const { isOnline, isAuthenticated, businessId } = get();
        if (isOnline && isAuthenticated && businessId) {
          const loggedAt = `${log.date}T${log.time || '00:00'}:00`;
          careLogService
            .create({
              business_id: businessId,
              horse_id: log.horseId,
              type: log.type as any,
              logged_at: loggedAt,
              logged_date: log.date,
              details: log.details as any,
              notes: log.notes || null,
              logged_by_name: log.loggedBy,
            })
            .then(({ error }) => {
              if (error) console.error('Failed to sync care log:', error);
            });
        }
      },

      updateCareLog: (id, updates) => {
        set((state) => ({
          careLogs: state.careLogs.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        }));

        const { isOnline, isAuthenticated } = get();
        if (isOnline && isAuthenticated) {
          careLogService.update(id, updates as any).catch(console.error);
        }
      },

      deleteCareLog: (id) => {
        set((state) => ({
          careLogs: state.careLogs.filter((l) => l.id !== id),
        }));

        const { isOnline, isAuthenticated } = get();
        if (isOnline && isAuthenticated) {
          careLogService.delete(id).catch(console.error);
        }
      },

      fetchCareLogs: async (horseId) => {
        const { isOnline, isAuthenticated, businessId } = get();
        if (!isOnline || !isAuthenticated || !businessId) return;

        set({ loading: true });
        const { data, error } = await careLogService.getAll(businessId, { horseId });

        if (error) {
          set({ error: error.message, loading: false });
        } else if (data) {
          const careLogs: CareLog[] = data.data.map((l) => {
            const loggedAt = l.logged_at ? new Date(l.logged_at) : new Date();
            return {
              id: l.id,
              horseId: l.horse_id,
              type: l.type as CareLog['type'],
              date: l.logged_date || loggedAt.toISOString().split('T')[0],
              time: loggedAt.toTimeString().slice(0, 5),
              details: (l.details as CareLog['details']) || {},
              notes: l.notes || undefined,
              loggedBy: l.logged_by_name || 'Unknown',
              photos: l.photos || undefined,
              createdAt: l.created_at,
            };
          });
          set({ careLogs, loading: false });
        }
      },

      // Reminder actions
      addReminder: (reminder) => {
        set((state) => ({ reminders: [...state.reminders, reminder] }));

        const { isOnline, isAuthenticated, businessId } = get();
        if (isOnline && isAuthenticated && businessId) {
          reminderService
            .create({
              business_id: businessId,
              horse_id: reminder.horseId || null,
              title: reminder.title,
              type: reminder.type as any,
              description: reminder.notes || null,
              due_date: reminder.dueDate,
              priority: reminder.priority as any,
              repeat_interval: reminder.repeat as any,
            })
            .catch(console.error);
        }
      },

      updateReminder: (id, updates) => {
        set((state) => ({
          reminders: state.reminders.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        }));

        const { isOnline, isAuthenticated } = get();
        if (isOnline && isAuthenticated) {
          reminderService.update(id, updates as any).catch(console.error);
        }
      },

      deleteReminder: (id) => {
        set((state) => ({
          reminders: state.reminders.filter((r) => r.id !== id),
        }));

        const { isOnline, isAuthenticated } = get();
        if (isOnline && isAuthenticated) {
          reminderService.delete(id).catch(console.error);
        }
      },

      completeReminder: (id) => {
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, completed: true, completedAt: new Date().toISOString() } : r
          ),
        }));

        const { isOnline, isAuthenticated } = get();
        if (isOnline && isAuthenticated) {
          reminderService.complete(id).catch(console.error);
        }
      },

      fetchReminders: async () => {
        const { isOnline, isAuthenticated, businessId } = get();
        if (!isOnline || !isAuthenticated || !businessId) return;

        set({ loading: true });
        const { data, error } = await reminderService.getAll(businessId);

        if (error) {
          set({ error: error.message, loading: false });
        } else if (data) {
          // Helper to convert minutes to LeadTime string
          const minutesToLeadTime = (minutes: number): Reminder['leadReminder'] => {
            if (minutes <= 0) return 'none';
            if (minutes <= 15) return '15min';
            if (minutes <= 60) return '1hour';
            if (minutes <= 1440) return '1day';
            if (minutes <= 4320) return '3days';
            if (minutes <= 10080) return '1week';
            return '2weeks';
          };

          const reminders: Reminder[] = data.map((r) => ({
            id: r.id,
            horseId: r.horse_id || '',
            title: r.title,
            type: r.type as Reminder['type'],
            dueDate: r.due_date,
            priority: r.priority as Reminder['priority'],
            repeat: r.repeat_interval as Reminder['repeat'],
            notes: r.description || undefined,
            completed: r.completed,
            completedAt: r.completed_at || undefined,
            leadReminder: minutesToLeadTime(r.lead_time_minutes || 1440),
            assignedTo: r.assigned_to || undefined,
            createdAt: r.created_at,
          }));
          set({ reminders, loading: false });
        }
      },

      // Document actions
      addDocument: (doc) => set((state) => ({ documents: [...state.documents, doc] })),
      updateDocument: (id, updates) =>
        set((state) => ({
          documents: state.documents.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        })),
      deleteDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        })),

      // Event actions with Supabase sync
      addEvent: (event) => {
        set((state) => ({ events: [...state.events, event] }));

        const { isOnline, isAuthenticated, businessId } = get();
        if (isOnline && isAuthenticated && businessId) {
          calendarService
            .createEvent({
              business_id: businessId,
              horse_id: event.horseId || null,
              title: event.title,
              type: event.type as any,
              event_date: event.date,
              start_time: event.startTime || null,
              end_time: event.endTime || null,
              description: event.notes || null,
              location: event.location || null,
            })
            .catch(console.error);
        }
      },

      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }));

        const { isOnline, isAuthenticated } = get();
        if (isOnline && isAuthenticated) {
          calendarService.updateEvent(id, updates as any).catch(console.error);
        }
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        }));

        const { isOnline, isAuthenticated } = get();
        if (isOnline && isAuthenticated) {
          calendarService.deleteEvent(id).catch(console.error);
        }
      },

      fetchEvents: async (startDate, endDate) => {
        const { isOnline, isAuthenticated, businessId } = get();
        if (!isOnline || !isAuthenticated || !businessId) return;

        const start = startDate || new Date().toISOString().split('T')[0];
        const end =
          endDate ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        set({ loading: true });
        const { data, error } = await calendarService.getEvents(businessId, start, end);

        if (error) {
          set({ error: error.message, loading: false });
        } else if (data) {
          const events: CalendarEvent[] = data.map((e) => ({
            id: e.id,
            horseId: e.horse_id || '',
            title: e.title,
            type: e.type as CalendarEvent['type'],
            date: e.event_date,
            startTime: e.start_time || undefined,
            endTime: e.end_time || undefined,
            allDay: !e.start_time, // All day if no start time
            notes: e.description || undefined,
            location: e.location || undefined,
            calendarId: e.calendar_type_id || undefined,
          }));
          set({ events, loading: false });
        }
      },

      // Team Management actions
      addTeamMember: (member) =>
        set((state) => ({
          teamMembers: [...state.teamMembers, member],
        })),

      updateTeamMember: (id, updates) =>
        set((state) => ({
          teamMembers: state.teamMembers.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),

      removeTeamMember: (id) => {
        set((state) => ({
          teamMembers: state.teamMembers.filter((m) => m.id !== id),
        }));

        const { isOnline, isAuthenticated } = get();
        if (isOnline && isAuthenticated) {
          businessService.removeMember(id).catch(console.error);
        }
      },

      fetchTeamMembers: async () => {
        const { isOnline, isAuthenticated, businessId } = get();
        if (!isOnline || !isAuthenticated || !businessId) return;

        set({ loading: true });
        const { data, error } = await businessService.getTeamMembers(businessId);

        if (error) {
          set({ error: error.message, loading: false });
        } else if (data) {
          const teamMembers: TeamMember[] = data.map((m: any) => ({
            id: m.id,
            name: m.user_profile?.name || m.user_profile?.email || 'Unknown',
            email: m.user_profile?.email || '',
            role: m.role,
            joinedAt: m.joined_at,
            status: m.status,
            assignedHorses: m.assigned_horse_ids || [],
          }));
          set({ teamMembers, loading: false });
        }
      },

      // Team Invite actions
      inviteTeamMember: (invite) =>
        set((state) => ({
          teamInvites: [...state.teamInvites, invite],
        })),

      updateInvite: (id, updates) =>
        set((state) => ({
          teamInvites: state.teamInvites.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),

      deleteInvite: (id) =>
        set((state) => ({
          teamInvites: state.teamInvites.filter((i) => i.id !== id),
        })),

      // Subscription actions
      updateSubscription: (updates) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                subscription: { ...state.user.subscription, ...updates },
              }
            : null,
        })),

      canInviteMoreMembers: (): boolean => {
        const state = get();
        if (!state.user) return false;

        const maxUsers = state.user.subscription.maxUsers;
        const currentMemberCount =
          state.teamMembers.filter((m: TeamMember) => m.status === 'active').length + 1;

        return currentMemberCount < maxUsers;
      },

      getMaxUsers: (): number => {
        const state = get();
        if (!state.user) return 1;
        return state.user.subscription.maxUsers;
      },

      // UI actions
      setSelectedHorseId: (id: string | null) => set({ selectedHorseId: id }),
      setSelectedCalendarId: (id: string) => set({ selectedCalendarId: id }),

      // Calendar Type actions
      addCalendarType: (calendarType: CalendarType) => {
        set((state) => ({
          calendarTypes: [...state.calendarTypes, calendarType],
        }));

        const { isOnline, isAuthenticated, businessId } = get();
        if (isOnline && isAuthenticated && businessId) {
          calendarService
            .createCalendarType({
              business_id: businessId,
              name: calendarType.name,
              color: calendarType.color,
              is_default: calendarType.isDefault,
              is_visible: calendarType.isVisible,
            })
            .catch(console.error);
        }
      },

      updateCalendarType: (id: string, updates: Partial<CalendarType>) => {
        set((state) => ({
          calendarTypes: state.calendarTypes.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));

        const { isOnline, isAuthenticated } = get();
        if (isOnline && isAuthenticated) {
          calendarService.updateCalendarType(id, updates as any).catch(console.error);
        }
      },

      deleteCalendarType: (id: string) => {
        set((state) => ({
          calendarTypes: state.calendarTypes.filter((c) => c.id !== id),
        }));

        const { isOnline, isAuthenticated } = get();
        if (isOnline && isAuthenticated) {
          calendarService.deleteCalendarType(id).catch(console.error);
        }
      },

      toggleCalendarVisibility: (id: string) => {
        set((state) => ({
          calendarTypes: state.calendarTypes.map((c) =>
            c.id === id ? { ...c, isVisible: !c.isVisible } : c
          ),
        }));

        const { isOnline, isAuthenticated } = get();
        if (isOnline && isAuthenticated) {
          calendarService.toggleCalendarVisibility(id).catch(console.error);
        }
      },

      fetchCalendarTypes: async () => {
        const { isOnline, isAuthenticated, businessId } = get();
        if (!isOnline || !isAuthenticated || !businessId) return;

        const { data, error } = await calendarService.getCalendarTypes(businessId);

        if (error) {
          console.error('Failed to fetch calendar types:', error);
        } else if (data) {
          const calendarTypes: CalendarType[] = data.map((c) => ({
            id: c.id,
            name: c.name,
            color: c.color,
            isDefault: c.is_default,
            isVisible: c.is_visible,
          }));
          set({ calendarTypes });
        }
      },

      // Horse Alert actions
      addHorseAlert: (alert: HorseAlert) => {
        set((state) => ({
          horseAlerts: [...state.horseAlerts, alert],
        }));

        const { isOnline, isAuthenticated, businessId } = get();
        if (isOnline && isAuthenticated && businessId) {
          horseService
            .createAlert({
              horse_id: alert.horseId,
              business_id: businessId,
              type: alert.type as any,
              title: alert.title,
              description: alert.message || null,
              priority: alert.priority as any,
              expires_at: alert.expiresAt,
            })
            .catch(console.error);
        }
      },

      updateHorseAlert: (id: string, updates: Partial<HorseAlert>) => {
        set((state) => ({
          horseAlerts: state.horseAlerts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        }));

        const { isOnline, isAuthenticated } = get();
        if (isOnline && isAuthenticated) {
          horseService.updateAlert(id, updates as any).catch(console.error);
        }
      },

      deleteHorseAlert: (id: string) => {
        set((state) => ({
          horseAlerts: state.horseAlerts.filter((a) => a.id !== id),
        }));

        const { isOnline, isAuthenticated } = get();
        if (isOnline && isAuthenticated) {
          horseService.deleteAlert(id).catch(console.error);
        }
      },

      getActiveAlertsForHorse: (horseId: string): HorseAlert[] => {
        const state = get();
        const now = new Date().toISOString();
        return state.horseAlerts.filter(
          (a) => a.horseId === horseId && a.isActive && a.expiresAt > now
        );
      },

      fetchHorseAlerts: async () => {
        const { isOnline, isAuthenticated, businessId } = get();
        if (!isOnline || !isAuthenticated || !businessId) return;

        const { data, error } = await horseService.getAllActiveAlerts(businessId);

        if (error) {
          console.error('Failed to fetch alerts:', error);
        } else if (data) {
          const horseAlerts: HorseAlert[] = data.map((a) => ({
            id: a.id,
            horseId: a.horse_id,
            type: a.type as HorseAlert['type'],
            title: a.title,
            message: a.description || '',
            priority: a.priority as HorseAlert['priority'],
            isActive: a.is_active,
            expiresAt: a.expires_at,
            createdBy: a.created_by || '',
            createdAt: a.created_at,
          }));
          set({ horseAlerts });
        }
      },

      // Direct Message actions
      addMessage: (message: DirectMessage) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      markMessageAsRead: (id: string) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, isRead: true, readAt: new Date().toISOString() } : m
          ),
        })),

      deleteMessage: (id: string) =>
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== id),
        })),

      getUnreadMessageCount: (): number => {
        const state = get();
        return state.messages.filter((m) => !m.isRead).length;
      },

      // Weather location
      setWeatherLocation: (location: string | null) => set({ weatherLocation: location }),

      // User Mode actions
      setUserMode: (mode: UserMode) =>
        set((state) => ({
          user: state.user ? { ...state.user, userMode: mode } : null,
        })),

      addLinkedBusiness: (business: LinkedBusiness) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                linkedBusinesses: [...state.user.linkedBusinesses, business],
              }
            : null,
        })),

      removeLinkedBusiness: (businessId: string) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                linkedBusinesses: state.user.linkedBusinesses.filter((b) => b.id !== businessId),
              }
            : null,
        })),

      setActiveBusiness: (businessId: string) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                linkedBusinesses: state.user.linkedBusinesses.map((b) => ({
                  ...b,
                  isActive: b.id === businessId,
                })),
              }
            : null,
        })),

      getActiveBusiness: (): LinkedBusiness | null => {
        const state = get();
        if (!state.user) return null;
        return state.user.linkedBusinesses.find((b) => b.isActive) || null;
      },

      isOwnerMode: (): boolean => {
        const state = get();
        return state.user?.userMode === 'standard' && state.user?.role === 'owner';
      },

      isTrainerMode: (): boolean => {
        const state = get();
        return state.user?.userMode === 'trainer';
      },

      isStaffMode: (): boolean => {
        const state = get();
        return state.user?.userMode === 'staff';
      },

      isBoarderMode: (): boolean => {
        const state = get();
        return state.user?.userMode === 'boarder';
      },

      // Sync all data from Supabase
      syncAllData: async () => {
        const state = get();
        if (!state.isOnline || !state.isAuthenticated || !state.businessId) {
          console.log('Skipping sync: offline or not authenticated');
          return;
        }

        set({ loading: true, error: null });

        try {
          await Promise.all([
            state.fetchHorses(),
            state.fetchCareLogs(),
            state.fetchReminders(),
            state.fetchEvents(),
            state.fetchTeamMembers(),
            state.fetchCalendarTypes(),
            state.fetchHorseAlerts(),
          ]);
        } catch (error) {
          console.error('Error syncing data:', error);
          set({ error: 'Failed to sync data' });
        } finally {
          set({ loading: false });
        }
      },

      // Clear local data (for logout)
      clearLocalData: () => {
        set({
          user: null,
          horses: [],
          careLogs: [],
          reminders: [],
          documents: [],
          events: [],
          teamMembers: [],
          teamInvites: [],
          calendarTypes: defaultCalendarTypes,
          horseAlerts: [],
          messages: [],
          isAuthenticated: false,
          businessId: null,
        });
      },
    }),
    {
      name: 'horse-care-storage',
      // Version 2: Removed demo data, now uses real Supabase data only
      version: 2,
      // Only persist UI preferences, not data (data comes from Supabase)
      partialize: (state) => ({
        weatherLocation: state.weatherLocation,
        selectedCalendarId: state.selectedCalendarId,
      }),
      // Migration to clear old demo data when version changes
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          // Clear all old data from v1 that had demo data
          return {
            weatherLocation: null,
            selectedCalendarId: 'all',
          };
        }
        return persistedState;
      },
    }
  )
);
