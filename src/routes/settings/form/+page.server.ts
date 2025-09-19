import { fail, redirect } from '@sveltejs/kit';
import { authenticatedFetch, API_BASE_URL } from '$lib/api.server';
import type { PageServerLoad, Actions } from './$types';

interface Provider {
	id?: number;
	firstname: string;
	lastname: string;
}

interface QuickPlan {
	id?: number;
	name: string;
	codes: string[];
}

interface Billable {
	name: string;
	cost: number;
	code: string;
}

export const load: PageServerLoad = async ({ cookies, parent }) => {
	try {
		// Get session data from parent layout
		const { session } = await parent();

		// If no valid session, return empty data
		if (!session?.access_token || !session?.user) {
			console.log('[Settings Form] No valid session - returning empty data');
			return {
				providers: [],
				billables: [],
				displayCodes: [],
				quickPlans: [],
				error: 'Authentication required'
			};
		}

		// Create authInfo object with fresh session token for API calls
		const authInfo = {
			token: session.access_token,
			user: session.user
		};

		// Load all data in parallel
		const [providersRes, billablesRes, displayCodesRes, quickPlansRes] = await Promise.all([
			authenticatedFetch(`${API_BASE_URL}/providers`, {}, authInfo, cookies),
			authenticatedFetch(`${API_BASE_URL}/billables`, {}, authInfo, cookies),
			authenticatedFetch(`${API_BASE_URL}/settings/display-codes`, {}, authInfo, cookies),
			authenticatedFetch(`${API_BASE_URL}/quick-plans`, {}, authInfo, cookies)
		]);

		// Process providers
		let providers: Provider[] = [];
		if (providersRes.ok) {
			const providersData = await providersRes.json();
			providers = (providersData.data || []).map((p: any) => ({
				id: p.providerid ?? p.id,
				firstname: p.firstname ?? '',
				lastname: p.lastname ?? ''
			}));
		}

		// Process billables
		let billables: Billable[] = [];
		if (billablesRes.ok) {
			const billablesData = await billablesRes.json();
			billables = (billablesData.data || []).map((b: { billable_code: string; description: string; cost: number }) => ({
				name: b.description,
				cost: b.cost,
				code: b.billable_code
			}));
		}

		// Process display codes
		let displayCodes: string[] = [];
		if (displayCodesRes.ok) {
			const displayCodesData = await displayCodesRes.json();
			displayCodes = displayCodesData.data || [];
		}

		// Process quick plans
		let quickPlans: QuickPlan[] = [];
		if (quickPlansRes.ok) {
			const quickPlansData = await quickPlansRes.json();
			quickPlans = (quickPlansData.data || []).map((qp: any) => ({
				id: qp.id,
				name: qp.name,
				codes: qp.billables.map((b: any) => b.billable_code)
			}));
		}

		return {
			providers,
			billables,
			displayCodes,
			quickPlans
		};
	} catch (error) {
		console.error('Failed to load settings data:', error);
		return {
			providers: [],
			billables: [],
			displayCodes: [],
			quickPlans: []
		};
	}
};

export const actions: Actions = {
	createProvider: async ({ request, cookies }) => {
		const formData = await request.formData();
		const firstname = formData.get('firstname') as string;
		const lastname = formData.get('lastname') as string;

		if (!firstname.trim() && !lastname.trim()) {
			return fail(400, { error: 'Provider name is required' });
		}

		try {
			const response = await authenticatedFetch(`${API_BASE_URL}/providers`, {
				method: 'POST',
				body: JSON.stringify({ firstname, lastname })
			}, undefined, cookies);

			if (!response.ok) {
				return fail(response.status, { error: 'Failed to create provider' });
			}

			return { success: true, message: `Dr. ${firstname} ${lastname} added successfully` };
		} catch (error) {
			return fail(500, { error: 'Failed to create provider' });
		}
	},

	updateProvider: async ({ request, cookies }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const firstname = formData.get('firstname') as string;
		const lastname = formData.get('lastname') as string;

		if (!id) {
			return fail(400, { error: 'Provider ID is required' });
		}

		try {
			const response = await authenticatedFetch(`${API_BASE_URL}/providers/${id}`, {
				method: 'PUT',
				body: JSON.stringify({ firstname, lastname })
			}, undefined, cookies);

			if (!response.ok) {
				return fail(response.status, { error: 'Failed to update provider' });
			}

			return { success: true, message: `Dr. ${firstname} ${lastname} updated successfully` };
		} catch (error) {
			return fail(500, { error: 'Failed to update provider' });
		}
	},

	deleteProvider: async ({ request, cookies }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'Provider ID is required' });
		}

		try {
			const response = await authenticatedFetch(`${API_BASE_URL}/providers/${id}`, {
				method: 'DELETE'
			}, undefined, cookies);

			if (!response.ok) {
				return fail(response.status, { error: 'Failed to delete provider' });
			}

			return { success: true, message: 'Provider deleted successfully' };
		} catch (error) {
			return fail(500, { error: 'Failed to delete provider' });
		}
	},

	updateDisplayCodes: async ({ request, cookies }) => {
		const formData = await request.formData();
		const codes = formData.getAll('codes') as string[];

		try {
			const response = await authenticatedFetch(`${API_BASE_URL}/settings/display-codes`, {
				method: 'PUT',
				body: JSON.stringify({ codes })
			}, undefined, cookies);

			if (!response.ok) {
				return fail(response.status, { error: 'Failed to update display codes' });
			}

			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to update display codes' });
		}
	},

	createQuickPlan: async ({ request, cookies }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const codes = formData.getAll('codes') as string[];

		if (!name.trim()) {
			return fail(400, { error: 'Plan name is required' });
		}

		try {
			const response = await authenticatedFetch(`${API_BASE_URL}/quick-plans`, {
				method: 'POST',
				body: JSON.stringify({
					name,
					billable_codes: codes
				})
			}, undefined, cookies);

			if (!response.ok) {
				return fail(response.status, { error: 'Failed to create quick plan' });
			}

			return { success: true, message: 'Quick plan created successfully' };
		} catch (error) {
			return fail(500, { error: 'Failed to create quick plan' });
		}
	},

	updateQuickPlan: async ({ request, cookies }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const name = formData.get('name') as string;
		const codes = formData.getAll('codes') as string[];

		if (!id) {
			return fail(400, { error: 'Plan ID is required' });
		}

		try {
			const response = await authenticatedFetch(`${API_BASE_URL}/quick-plans/${id}`, {
				method: 'PUT',
				body: JSON.stringify({
					name,
					billable_codes: codes
				})
			}, undefined, cookies);

			if (!response.ok) {
				return fail(response.status, { error: 'Failed to update quick plan' });
			}

			return { success: true, message: 'Quick plan updated successfully' };
		} catch (error) {
			return fail(500, { error: 'Failed to update quick plan' });
		}
	},

	deleteQuickPlan: async ({ request, cookies }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'Plan ID is required' });
		}

		try {
			const response = await authenticatedFetch(`${API_BASE_URL}/quick-plans/${id}`, {
				method: 'DELETE'
			}, undefined, cookies);

			if (!response.ok) {
				return fail(response.status, { error: 'Failed to delete quick plan' });
			}

			return { success: true, message: 'Quick plan deleted successfully' };
		} catch (error) {
			return fail(500, { error: 'Failed to delete quick plan' });
		}
	}
};