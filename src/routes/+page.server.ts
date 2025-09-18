import type { PageServerLoad, Actions } from './$types';
import { createSupabaseServerClient } from '$lib/supabase.server';
import { redirect } from '@sveltejs/kit';
import { authenticatedFetch, API_BASE_URL } from '$lib/api.server';

export const load: PageServerLoad = async (event) => {
	const supabase = createSupabaseServerClient(event);

	try {
		const { data: { user }, error } = await supabase.auth.getUser();

		if (error && !error.message?.includes('Auth session missing')) {
			console.error('Error getting user:', error);
		}

		return {
			user
		};
	} catch (error) {
		return {
			user: null
		};
	}
};

export const actions: Actions = {
	logout: async (event) => {
		const supabase = createSupabaseServerClient(event);
		await supabase.auth.signOut();
		redirect(302, '/');
	},

	testProfiles: async (event) => {
		try {
			const response = await authenticatedFetch(`${API_BASE_URL}/profiles`, {}, undefined, event);

			if (response.ok) {
				const profiles = await response.json();
				console.log('Profiles data:', profiles);
				return {
					success: true,
					profiles
				};
			} else {
				return {
					success: false,
					error: `Failed to fetch profiles: ${response.status} ${response.statusText}`
				};
			}
		} catch (error) {
			return {
				success: false,
				error: `Error fetching profiles: ${error instanceof Error ? error.message : 'Unknown error'}`
			};
		}
	}
};