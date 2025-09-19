import { createSupabaseServerClient } from '$lib/supabase.server';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  try {
    const supabase = createSupabaseServerClient(url.searchParams as any);
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