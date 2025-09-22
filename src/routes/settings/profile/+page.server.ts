import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { authenticatedFetch } from '$lib/api.server';

const profileSchema = z.object({
	firstname: z.string().min(1, 'First name is required'),
	lastname: z.string().min(1, 'Last name is required'),
	bio: z.string().optional(),
	specialty: z.string().optional(),
	credentials: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().email().optional()
});

export const load: PageServerLoad = async ({ fetch, cookies, parent }) => {
	try {
		// Get session data from parent layout
		const { session } = await parent();

		console.log('[Profile] Page load - Session check:', {
			hasSession: !!session,
			hasUser: !!session?.user,
			hasAccessToken: !!session?.access_token,
			userId: session?.user?.id
		});

		// If no valid session, redirect to login
		if (!session?.access_token || !session?.user) {
			console.log('[Profile] No valid session - redirecting to login');
			throw redirect(302, '/login');
		}

		// Fetch provider profile data
		const response = await event.fetch(`https://smile-design-manhattan-api.vercel.app/providers/profile`, {
			headers: {
				'Authorization': `Bearer ${session.access_token}`,
				'Content-Type': 'application/json'
			}
		});

		let providerProfile = null;
		if (response.ok) {
			providerProfile = await response.json();
		}

		// Fetch provider's presentations
		const presentationsResponse = await event.fetch(`https://smile-design-manhattan-api.vercel.app/presentations`, {
			headers: {
				'Authorization': `Bearer ${session.access_token}`,
				'Content-Type': 'application/json'
			}
		});

		let presentations = [];
		let slideData = {};
		let hasExistingPresentation = false;

		if (presentationsResponse.ok) {
			presentations = await presentationsResponse.json();

			// If user has a presentation, fetch its slides and elements
			if (presentations && presentations.length > 0) {
				hasExistingPresentation = true;
				const presentationId = presentations[0].id;

				// Fetch slides for the presentation
				const slidesResponse = await event.fetch(`https://smile-design-manhattan-api.vercel.app/presentations/${presentationId}/slides`, {
					headers: {
						'Authorization': `Bearer ${session.access_token}`,
						'Content-Type': 'application/json'
					}
				});

				if (slidesResponse.ok) {
					const slides = await slidesResponse.json();

					// For each slide, fetch its image elements
					for (const slide of slides) {
						const elementsResponse = await event.fetch(`https://smile-design-manhattan-api.vercel.app/slides/${slide.id}/elements?type=image`, {
							headers: {
								'Authorization': `Bearer ${session.access_token}`,
								'Content-Type': 'application/json'
							}
						});

						if (elementsResponse.ok) {
							const elements = await elementsResponse.json();
							// Filter to only image elements for the gallery UI
							const imageElements = elements.filter((element: any) => element.element_type === 'image');
							slideData[slide.slide_type] = {
								slideId: slide.id,
								images: imageElements.sort((a, b) => a.element_order - b.element_order)
							};
						}
					}
				}
			}
		}

		const form = await superValidate(providerProfile || {}, zod(profileSchema));

		return {
			form,
			providerProfile,
			presentations,
			slideData,
			hasExistingPresentation
		};
	} catch (error) {
		if (error instanceof Response && error.status === 302) {
			throw error; // Re-throw redirect responses
		}
		console.error('Error loading provider profile:', error);
		const form = await superValidate({}, zod(profileSchema));
		return {
			form,
			providerProfile: null,
			presentations: [],
			slideData: {},
			hasExistingPresentation: false
		};
	}
};

export const actions: Actions = {
	updateProfile: async (event) => {
		try {
			// Get session data from parent layout
			const { session } = await event.parent();

			if (!session?.access_token || !session?.user) {
				return fail(401, { error: 'Not authenticated' });
			}

			const form = await superValidate(event.request, zod(profileSchema));

			if (!form.valid) {
				return fail(400, { form });
			}

			const response = await event.fetch(`https://smile-design-manhattan-api.vercel.app/providers/profile`, {
				method: 'PUT',
				headers: {
					'Authorization': `Bearer ${session.access_token}`,
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
				form: await superValidate({}, zod(profileSchema)),
				error: 'Server error occurred'
			});
		}
	},

	uploadProfilePhoto: async (event) => {
		try {
			// Get session data from parent layout
			const { session } = await event.parent();

			if (!session?.access_token || !session?.user) {
				return fail(401, { error: 'Not authenticated' });
			}

			const formData = await event.request.formData();
			const photo = formData.get('photo') as File;

			if (!photo || photo.size === 0) {
				return fail(400, { error: 'No photo provided' });
			}

			// Create FormData for file upload
			const uploadFormData = new FormData();
			uploadFormData.append('photo', photo);

			const response = await event.fetch(`https://smile-design-manhattan-api.vercel.app/providers/profile/photo`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${session.access_token}`
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
	},

	uploadSlideImage: async (event) => {
		try {
			// Get session data from parent layout
			const { session } = await event.parent();

			if (!session?.access_token || !session?.user) {
				return fail(401, { error: 'Not authenticated' });
			}

			const formData = await event.request.formData();
			const slideType = formData.get('slideType') as string;
			const position = parseInt(formData.get('position') as string);
			const image = formData.get('image') as File;

			if (!slideType || isNaN(position) || !image || image.size === 0) {
				return fail(400, { error: 'Missing required fields' });
			}

			// First, get or create presentation for this profile
			let presentationId;
			const presentationsResponse = await event.fetch(`https://smile-design-manhattan-api.vercel.app/presentations`, {
				headers: {
					'Authorization': `Bearer ${session.access_token}`,
					'Content-Type': 'application/json'
				}
			});

			if (presentationsResponse.ok) {
				const presentations = await presentationsResponse.json();
				if (presentations && presentations.length > 0) {
					presentationId = presentations[0].id;
				} else {
					// Create a default presentation
					const createPresentationResponse = await event.fetch(`https://smile-design-manhattan-api.vercel.app/presentations`, {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${session.access_token}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							title: 'Default Slide Presentation',
							description: 'Provider slide gallery'
						})
					});

					if (createPresentationResponse.ok) {
						const newPresentation = await createPresentationResponse.json();
						presentationId = newPresentation.id;
					} else {
						return fail(500, { error: 'Failed to create presentation' });
					}
				}
			} else {
				return fail(500, { error: 'Failed to fetch presentations' });
			}

			// Get or create slide for this slide type
			let slideId;
			const slidesResponse = await event.fetch(`https://smile-design-manhattan-api.vercel.app/presentations/${presentationId}/slides`, {
				headers: {
					'Authorization': `Bearer ${session.access_token}`,
					'Content-Type': 'application/json'
				}
			});

			if (slidesResponse.ok) {
				const slides = await slidesResponse.json();
				const existingSlide = slides.find((s: any) => s.slide_type === slideType);

				if (existingSlide) {
					slideId = existingSlide.id;
				} else {
					// Create new slide
					const createSlideResponse = await event.fetch(`https://smile-design-manhattan-api.vercel.app/presentations/${presentationId}/slides`, {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${session.access_token}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							slide_type: slideType,
							slide_order: 1,
							title: slideType.charAt(0).toUpperCase() + slideType.slice(1)
						})
					});

					if (createSlideResponse.ok) {
						const newSlide = await createSlideResponse.json();
						slideId = newSlide.id;
					} else {
						return fail(500, { error: 'Failed to create slide' });
					}
				}
			} else {
				return fail(500, { error: 'Failed to fetch slides' });
			}

			// Upload the image file first
			const uploadFormData = new FormData();
			uploadFormData.append('image', image);

			const imageUploadResponse = await event.fetch(`https://smile-design-manhattan-api.vercel.app/images/upload`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${session.access_token}`
				},
				body: uploadFormData
			});

			if (!imageUploadResponse.ok) {
				return fail(500, { error: 'Failed to upload image' });
			}

			const uploadResult = await imageUploadResponse.json();
			const imageUrl = uploadResult.url;

			// Check if element already exists at this position
			const existingElementsResponse = await event.fetch(`https://smile-design-manhattan-api.vercel.app/slides/${slideId}/elements?type=image`, {
				headers: {
					'Authorization': `Bearer ${session.access_token}`,
					'Content-Type': 'application/json'
				}
			});

			if (existingElementsResponse.ok) {
				const existingElements = await existingElementsResponse.json();
				const existingElement = existingElements.find((e: any) => e.element_order === position);

				if (existingElement) {
					// Update existing element
					const updateResponse = await event.fetch(`https://smile-design-manhattan-api.vercel.app/slide-elements/${existingElement.id}`, {
						method: 'PUT',
						headers: {
							'Authorization': `Bearer ${session.access_token}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							image_url: imageUrl,
							alt_text: `${slideType} image ${position + 1}`
						})
					});

					if (!updateResponse.ok) {
						return fail(500, { error: 'Failed to update slide element' });
					}
				} else {
					// Create new element
					const createElement = await event.fetch(`https://smile-design-manhattan-api.vercel.app/slide-elements`, {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${session.access_token}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							slide_id: slideId,
							element_type: 'image',
							element_order: position,
							image_url: imageUrl,
							alt_text: `${slideType} image ${position + 1}`
						})
					});

					if (!createElement.ok) {
						return fail(500, { error: 'Failed to create slide element' });
					}
				}
			}

			return {
				success: true,
				message: 'Slide image uploaded successfully'
			};

		} catch (error) {
			console.error('Error uploading slide image:', error);
			return fail(500, { error: 'Server error occurred' });
		}
	},

	removeSlideImage: async (event) => {
		try {
			// Get session data from parent layout
			const { session } = await event.parent();

			if (!session?.access_token || !session?.user) {
				return fail(401, { error: 'Not authenticated' });
			}

			const formData = await event.request.formData();
			const slideType = formData.get('slideType') as string;
			const position = parseInt(formData.get('position') as string);

			if (!slideType || isNaN(position)) {
				return fail(400, { error: 'Missing required fields' });
			}

			// Get presentation and slide
			const presentationsResponse = await event.fetch(`https://smile-design-manhattan-api.vercel.app/presentations`, {
				headers: {
					'Authorization': `Bearer ${session.access_token}`,
					'Content-Type': 'application/json'
				}
			});

			if (!presentationsResponse.ok) {
				return fail(500, { error: 'Failed to fetch presentations' });
			}

			const presentations = await presentationsResponse.json();
			if (!presentations || presentations.length === 0) {
				return fail(404, { error: 'No presentation found' });
			}

			const presentationId = presentations[0].id;

			// Get slides
			const slidesResponse = await event.fetch(`https://smile-design-manhattan-api.vercel.app/presentations/${presentationId}/slides`, {
				headers: {
					'Authorization': `Bearer ${session.access_token}`,
					'Content-Type': 'application/json'
				}
			});

			if (!slidesResponse.ok) {
				return fail(500, { error: 'Failed to fetch slides' });
			}

			const slides = await slidesResponse.json();
			const slide = slides.find((s: any) => s.slide_type === slideType);

			if (!slide) {
				return fail(404, { error: 'Slide not found' });
			}

			// Get elements for this slide
			const elementsResponse = await event.fetch(`https://smile-design-manhattan-api.vercel.app/slides/${slide.id}/elements?type=image`, {
				headers: {
					'Authorization': `Bearer ${session.access_token}`,
					'Content-Type': 'application/json'
				}
			});

			if (!elementsResponse.ok) {
				return fail(500, { error: 'Failed to fetch slide elements' });
			}

			const elements = await elementsResponse.json();
			const elementToRemove = elements.find((e: any) => e.element_order === position);

			if (!elementToRemove) {
				return fail(404, { error: 'Slide element not found' });
			}

			// Delete the element
			const deleteResponse = await event.fetch(`https://smile-design-manhattan-api.vercel.app/slide-elements/${elementToRemove.id}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${session.access_token}`,
					'Content-Type': 'application/json'
				}
			});

			if (!deleteResponse.ok) {
				return fail(500, { error: 'Failed to delete slide element' });
			}

			return {
				success: true,
				message: 'Slide image removed successfully'
			};

		} catch (error) {
			console.error('Error removing slide image:', error);
			return fail(500, { error: 'Server error occurred' });
		}
	},

	createSlideShow: async (event) => {
		try {
			// Create new presentation with professional template
			const createPresentationResponse = await authenticatedFetch(`https://smile-design-manhattan-api.vercel.app/presentations`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					title: 'Portfolio Presentation',
					description: 'A comprehensive showcase of my work and experience'
				})
			}, undefined, event);

			if (!createPresentationResponse.ok) {
				return fail(500, { error: 'Failed to create slide show' });
			}

			const newPresentation = await createPresentationResponse.json();

			// Create professional slides with complete template structure
			const slidesData = [
				{ type: 'title', order: 1, title: 'Welcome to My Portfolio' },
				{ type: 'about', order: 2, title: 'About Me' },
				{ type: 'services', order: 3, title: 'My Services' },
				{ type: 'education', order: 4, title: 'Education & Experience' },
				{ type: 'contact', order: 5, title: 'Portfolio Gallery' }
			];

			// Create slides and their elements
			for (const slideData of slidesData) {
				// Create slide
				const slideResponse = await authenticatedFetch(`https://smile-design-manhattan-api.vercel.app/presentations/${newPresentation.id}/slides`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						slide_type: slideData.type,
						slide_order: slideData.order,
						title: slideData.title
					})
				}, undefined, event);

				if (slideResponse.ok) {
					const slide = await slideResponse.json();

					// Add elements based on slide type
					const elementsToCreate = [];

					switch (slideData.type) {
						case 'title':
							elementsToCreate.push(
								{ type: 'image', order: 1, url: 'https://picsum.photos/200/200?random=1', alt: 'Profile photo - small square' },
								{ type: 'image', order: 2, url: 'https://picsum.photos/800/400?random=2', alt: 'Hero background - large landscape' },
								{ type: 'heading', order: 3, content: 'Welcome to My Professional Portfolio' }
							);
							break;

						case 'about':
							elementsToCreate.push(
								{ type: 'image', order: 1, url: 'https://picsum.photos/150/150?random=3', alt: 'About me icon - small square' },
								{ type: 'heading', order: 2, content: 'About Me' },
								{ type: 'text', order: 3, content: 'I am a passionate professional with over 5 years of experience in web development and design.' },
								{ type: 'image', order: 4, url: 'https://picsum.photos/300/500?random=4', alt: 'Professional workspace - medium vertical' },
								{ type: 'text', order: 5, content: 'My expertise spans across modern web technologies, user experience design, and project management.' }
							);
							break;

						case 'services':
							elementsToCreate.push(
								{ type: 'image', order: 1, url: 'https://picsum.photos/180/180?random=5', alt: 'Services icon - small square' }
							);
							break;

						case 'education':
							elementsToCreate.push(
								{ type: 'heading', order: 1, content: 'Education & Professional Experience' },
								{ type: 'image', order: 2, url: 'https://picsum.photos/350/600?random=6', alt: 'University campus - medium vertical' },
								{ type: 'text', order: 3, content: 'Bachelor of Science in Computer Science from Tech University (2018). Master of Web Development from Digital Institute (2020). Currently working as Senior Frontend Developer at Innovation Corp.' }
							);
							break;

						case 'contact':
							elementsToCreate.push(
								{ type: 'text', order: 1, content: 'Here are some highlights from my recent projects:' },
								{ type: 'image', order: 2, url: 'https://picsum.photos/400/300?random=7', alt: 'Project 1 - E-commerce website' },
								{ type: 'image', order: 3, url: 'https://picsum.photos/400/300?random=8', alt: 'Project 2 - Mobile app design' },
								{ type: 'image', order: 4, url: 'https://picsum.photos/400/300?random=9', alt: 'Project 3 - Dashboard interface' },
								{ type: 'text', order: 5, content: 'Each project represents months of careful planning, design, and development work with amazing clients.' }
							);
							break;
					}

					// Create all elements for this slide
					for (const element of elementsToCreate) {
						const elementData: any = {
							slide_id: slide.id,
							element_type: element.type,
							element_order: element.order
						};

						if (element.type === 'image') {
							elementData.image_url = element.url;
							elementData.alt_text = element.alt;
						} else {
							elementData.content = element.content;
						}

						await authenticatedFetch(`https://smile-design-manhattan-api.vercel.app/slide-elements`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify(elementData)
						}, undefined, event);
					}
				}
			}

			return {
				success: true,
				message: 'Slide show created successfully',
				presentationId: newPresentation.id
			};

		} catch (error) {
			console.error('Error creating slide show:', error);
			return fail(500, { error: 'Server error occurred' });
		}
	}
};