import { createSupabaseServerClient } from '$lib/supabase.server';
import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async (event) => {
  try {
    const supabase = createSupabaseServerClient(event);
    // Get current user session
    const session = await supabase.auth.getSession();
    const token = session.data?.session?.access_token;
    const user = session.data?.session?.user;
    
    if (!token || !user) {
      // If no session, redirect to login
      throw redirect(302, '/login');
    }

    // Check user's profile status in Supabase
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('pending')
      .eq('auth_user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      // If we can't check status, allow them to stay on pending page
      return {
        user: {
          email: user.email,
          id: user.id
        }
      };
    }

    // If account is approved (pending = false), redirect to main app
    if (profile && profile.pending === false) {
      throw redirect(302, '/');
    }

    // If still pending or no profile found, stay on pending page
    return {
      user: {
        email: user.email,
        id: user.id
      },
      isPending: profile?.pending ?? true
    };

  } catch (error) {
    // If it's a redirect, let it through
    if (error instanceof Response) {
      throw error;
    }
    
    console.error('Error in pending page load:', error);
    // On any other error, redirect to login
    throw redirect(302, '/login');
  }
};

export const actions: Actions = {
  signOut: async (event) => {
    const supabase = createSupabaseServerClient(event);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Error signing out:', error);
        return fail(500, {
          error: 'Failed to sign out'
        });
      }

      return {
        success: true,
        redirectTo: '/login'
      };
    } catch (error) {
      console.error('Sign out error:', error);
      return fail(500, {
        error: 'Failed to sign out'
      });
    }
  }
};