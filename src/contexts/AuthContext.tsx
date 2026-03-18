import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { UserProfile, Business, BusinessMember } from '../types/database';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  activeBusiness: Business | null;
  activeMembership: BusinessMember | null;
  loading: boolean;
  initialized: boolean;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, name?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  setActiveBusiness: (businessId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    activeBusiness: null,
    activeMembership: null,
    loading: true,
    initialized: false,
  });

  // Fetch user profile
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  };

  // Fetch active business and membership
  const fetchActiveBusiness = async (userId: string): Promise<{
    business: Business | null;
    membership: BusinessMember | null;
  }> => {
    // First, try to get the active membership
    const { data: membership, error: memberError } = await supabase
      .from('business_members')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('status', 'active')
      .single();

    if (memberError || !membership) {
      // No active business, try to get any membership
      const { data: anyMembership } = await supabase
        .from('business_members')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .limit(1)
        .single();

      if (anyMembership) {
        // Set this one as active
        await supabase
          .from('business_members')
          .update({ is_active: true })
          .eq('id', anyMembership.id);

        // Fetch the business
        const { data: business } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', anyMembership.business_id)
          .single();

        return { business, membership: anyMembership };
      }

      return { business: null, membership: null };
    }

    // Fetch the business
    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', membership.business_id)
      .single();

    return { business, membership };
  };

  // Helper to load profile/business with a timeout so DB queries don't block forever
  const loadUserData = async (session: Session) => {
    const timeoutMs = 10000;
    const withTimeout = <T,>(promise: Promise<T>, fallback: T): Promise<T> =>
      Promise.race([
        promise,
        new Promise<T>((resolve) => setTimeout(() => resolve(fallback), timeoutMs)),
      ]);

    const profile = await withTimeout(fetchProfile(session.user.id), null);
    const { business, membership } = await withTimeout(
      fetchActiveBusiness(session.user.id),
      { business: null, membership: null }
    );

    return { profile, business, membership };
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Set user immediately so the app can proceed, then load profile data
        setState((prev) => ({
          ...prev,
          session,
          user: session.user,
          loading: true,
          initialized: true,
        }));

        const { profile, business, membership } = await loadUserData(session);

        setState({
          session,
          user: session.user,
          profile,
          activeBusiness: business,
          activeMembership: membership,
          loading: false,
          initialized: true,
        });
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          initialized: true,
        }));
      }
    }).catch((err) => {
      console.warn('Auth initialization failed:', err);
      setState((prev) => ({ ...prev, loading: false, initialized: true }));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);

        if (session?.user) {
          const isFirstSignIn = event === 'SIGNED_IN';

          // Only show loading spinner on first sign-in, not on token refresh
          if (isFirstSignIn) {
            setState((prev) => ({
              ...prev,
              session,
              user: session.user,
              loading: true,
              initialized: true,
            }));
          } else {
            // Token refresh — update session silently, keep existing data
            setState((prev) => ({
              ...prev,
              session,
              user: session.user,
            }));
          }

          // Refresh profile/business data in the background
          const { profile, business, membership } = await loadUserData(session);

          setState((prev) => ({
            ...prev,
            session,
            user: session.user,
            profile: profile || prev.profile,
            activeBusiness: business || prev.activeBusiness,
            activeMembership: membership || prev.activeMembership,
            loading: false,
            initialized: true,
          }));

          // Update last login (fire and forget)
          if (isFirstSignIn) {
            supabase
              .from('user_profiles')
              .update({ last_login: new Date().toISOString() })
              .eq('id', session.user.id)
              .then(() => {}, () => {});
          }
        } else {
          setState({
            session: null,
            user: null,
            profile: null,
            activeBusiness: null,
            activeMembership: null,
            loading: false,
            initialized: true,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up
  const signUp = async (email: string, password: string, name?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    return { error };
  };

  // Sign in with email/password
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  // Sign in with magic link
  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    return { error };
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Reset password
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return { error };
  };

  // Update password
  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  };

  // Update profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!state.user) {
      return { error: new Error('Not authenticated') };
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', state.user.id);

    if (!error) {
      setState((prev) => ({
        ...prev,
        profile: prev.profile ? { ...prev.profile, ...updates } : null,
      }));
    }

    return { error };
  };

  // Refresh profile
  const refreshProfile = async () => {
    if (!state.user) return;

    const profile = await fetchProfile(state.user.id);
    const { business, membership } = await fetchActiveBusiness(state.user.id);

    setState((prev) => ({
      ...prev,
      profile,
      activeBusiness: business,
      activeMembership: membership,
    }));
  };

  // Set active business
  const setActiveBusiness = async (businessId: string) => {
    if (!state.user) return;

    // Deactivate all memberships
    await supabase
      .from('business_members')
      .update({ is_active: false })
      .eq('user_id', state.user.id);

    // Activate the selected one
    await supabase
      .from('business_members')
      .update({ is_active: true })
      .eq('user_id', state.user.id)
      .eq('business_id', businessId);

    // Refresh
    await refreshProfile();
  };

  const value: AuthContextType = {
    ...state,
    signUp,
    signIn,
    signInWithMagicLink,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
    setActiveBusiness,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
