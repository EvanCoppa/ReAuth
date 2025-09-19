import type { LayoutServerLoad } from './$types';
import { createSupabaseServerClient } from '$lib/supabase.server';

export const load: LayoutServerLoad = async (event) => {
	const supabase = createSupabaseServerClient(event);

	console.log('[Layout] Loading layout server data...');

	try {
		// Get both user and session to have access token for API calls
		const { data: { session }, error: sessionError } = await supabase.auth.getSession();
		const { data: { user }, error: userError } = await supabase.auth.getUser();

		console.log('[Layout] Session check:', {
			hasSession: !!session,
			hasUser: !!user,
			hasAccessToken: !!session?.access_token,
			sessionError: sessionError?.message,
			userError: userError?.message,
			userId: session?.user?.id || user?.id
		});

		// Don't log "Auth session missing" as an error - it's normal when not logged in
		if (sessionError && !sessionError.message?.includes('Auth session missing')) {
			console.error('[Layout] Error getting session:', sessionError);
		}
		if (userError && !userError.message?.includes('Auth session missing')) {
			console.error('[Layout] Error getting user:', userError);
		}

		let userProfile = null;

		// If user is authenticated, fetch their profile data
		if (user) {
			try {
				const { data: profile } = await supabase
					.from('profiles')
					.select('first_name, last_name, pending')
					.eq('auth_user_id', user.id)
					.single();

				if (profile) {
					userProfile = {
						id: user.id,
						email: user.email,
						firstName: profile.first_name,
						lastName: profile.last_name,
						fullName: `${profile.first_name} ${profile.last_name}`.trim(),
						pending: profile.pending
					};
				}
			} catch (profileError) {
				console.error('Error fetching user profile:', profileError);
			}
		}

		// Include session with access token for API calls
		const sessionWithProfile = session && user ? {
			...session,
			user,
			userProfile,
			access_token: session.access_token
		} : null;

		return {
			session: sessionWithProfile
		};
	} catch (error) {
		// If there's any error getting the user, just return no session
		return {
			session: null
		};
	}
};
