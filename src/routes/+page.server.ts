import { createSupabaseServerClient } from '$lib/supabase.server';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  logout: async (event) => {
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