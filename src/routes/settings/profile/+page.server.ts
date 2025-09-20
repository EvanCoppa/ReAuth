import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

const profileSchema = z.object({
	firstname: z.string().min(1, 'First name is required'),
	lastname: z.string().min(1, 'Last name is required'),
	bio: z.string().optional(),
	specialty: z.string().optional(),
	credentials: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().email().optional()
});

export const load: PageServerLoad = async ({ fetch, cookies }) => {
	// Get session from cookies
	const sessionId = cookies.get('sessionId');
	if (!sessionId) {
		throw redirect(302, '/login');
	}

	try {
		// Fetch provider profile data
		const response = await fetch(`https://smile-design-manhattan-api.vercel.app/api/providers/profile`, {
			headers: {
				'Authorization': `Bearer ${sessionId}`,
				'Content-Type': 'application/json'
			}
		});

		let providerProfile = null;
		if (response.ok) {
			providerProfile = await response.json();
		}

		// Fetch provider's slide templates
		const slidesResponse = await fetch(`https://smile-design-manhattan-api.vercel.app/api/slide-templates/provider`, {
			headers: {
				'Authorization': `Bearer ${sessionId}`,
				'Content-Type': 'application/json'
			}
		});

		let slideTemplates = [];
		if (slidesResponse.ok) {
			slideTemplates = await slidesResponse.json();
		}

		const form = await superValidate(providerProfile || {}, zod(profileSchema));

		return {
			form,
			providerProfile,
			slideTemplates
		};
	} catch (error) {
		console.error('Error loading provider profile:', error);
		const form = await superValidate({}, zod(profileSchema));
		return {
			form,
			providerProfile: null,
			slideTemplates: []
		};
	}
};

export const actions: Actions = {
	updateProfile: async (event) => {
		const { request, fetch, cookies } = event;
		const sessionId = cookies.get('sessionId');
		if (!sessionId) {
			return fail(401, { error: 'Not authenticated' });
		}

		const form = await superValidate(request, zod(profileSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const response = await fetch(`https://smile-design-manhattan-api.vercel.app/api/providers/profile`, {
				method: 'PUT',
				headers: {
					'Authorization': `Bearer ${sessionId}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(form.data)
			});

			if (!response.ok) {
				const errorData = await response.json();
				return fail(400, {
					form,
					error: errorData.message || 'Failed to update profile'
				});
			}

			return {
				form,
				success: true,
				message: 'Profile updated successfully'
			};
		} catch (error) {
			console.error('Error updating profile:', error);
			return fail(500, {
				form,
				error: 'Server error occurred'
			});
		}
	},

	uploadProfilePhoto: async (event) => {
		const { request, fetch, cookies } = event;
		const sessionId = cookies.get('sessionId');
		if (!sessionId) {
			return fail(401, { error: 'Not authenticated' });
		}

		try {
			const formData = await request.formData();
			const photo = formData.get('photo') as File;

			if (!photo || photo.size === 0) {
				return fail(400, { error: 'No photo provided' });
			}

			// Create FormData for file upload
			const uploadFormData = new FormData();
			uploadFormData.append('photo', photo);

			const response = await fetch(`https://smile-design-manhattan-api.vercel.app/api/providers/profile/photo`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${sessionId}`
				},
				body: uploadFormData
			});

			if (!response.ok) {
				const errorData = await response.json();
				return fail(400, {
					error: errorData.message || 'Failed to upload photo'
				});
			}

			const result = await response.json();
			return {
				success: true,
				message: 'Profile photo updated successfully',
				photoUrl: result.photoUrl
			};
		} catch (error) {
			console.error('Error uploading photo:', error);
			return fail(500, { error: 'Server error occurred' });
		}
	}
};