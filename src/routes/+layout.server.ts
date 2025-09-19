import type { LayoutServerLoad } from './$types';
import { createSupabaseServerClient } from '$lib/supabase.server';

export const load: LayoutServerLoad = async (event) => {
	const supabase = createSupabaseServerClient(event);

	try {
		// Use getUser() instead of getSession() for better security
		const { data: { user }, error } = await supabase.auth.getUser();

		// Don't log "Auth session missing" as an error - it's normal when not logged in
		if (error && !error.message?.includes('Auth session missing')) {
			console.error('Error getting user:', error);
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

		// Convert user to session format for compatibility
		const session = user ? { user, userProfile } : null;

		return {
			session
		};
	} catch (error) {
		// If there's any error getting the user, just return no session
		return {
			session: null
		};
	}
};
