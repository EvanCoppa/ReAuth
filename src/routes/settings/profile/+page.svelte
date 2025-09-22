<script lang="ts">
	import { fade } from "svelte/transition";
	import { enhance } from "$app/forms";
	import { toastStore } from "$lib/toast";
	import { invalidateAll } from "$app/navigation";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import Camera from "@lucide/svelte/icons/camera";
	import Plus from "@lucide/svelte/icons/plus";
	import X from "@lucide/svelte/icons/x";
	import SlideGallery from "$lib/components/profile/SlideGallery.svelte";

	let { data, form } = $props();

	let activeTab = $state<"profile" | "slides">("profile");
	let profilePhotoPreview = $state<string | null>(null);
	let profilePhotoInput: HTMLInputElement;

	// Form element references
	let profileForm = $state<HTMLFormElement>();
	let photoForm = $state<HTMLFormElement>();
	let createSlideShowForm = $state<HTMLFormElement>();

	// Loading states
	let isCreatingSlideShow = $state(false);


	// $effect(() => {
	// 	if (form?.success && form?.message) {
	// 		toastStore.success(form.message);
	// 	} else if (form?.error) {
	// 		toastStore.error(form.error);
	// 	}
	// });

	// Debounce function for auto-save
	let saveTimeout: NodeJS.Timeout;
	function debouncedSave(formElement: HTMLFormElement, delay = 1000) {
		if (saveTimeout) {
			clearTimeout(saveTimeout);
		}
		saveTimeout = setTimeout(() => {
			formElement.requestSubmit();
		}, delay);
	}

	function handlePhotoChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				profilePhotoPreview = e.target?.result as string;
			};
			reader.readAsDataURL(file);

			// Auto-submit photo form
			if (photoForm) {
				photoForm.requestSubmit();
			}
		}
	}

	function triggerPhotoUpload() {
		profilePhotoInput?.click();
	}

	async function handleSlideUpload(event: CustomEvent<{ slideType: string; position: number; file: File }>) {
		const { slideType, position, file } = event.detail;
		console.log(`Uploading file for slide ${slideType}, position ${position}:`, file.name);

		try {
			const formData = new FormData();
			formData.set('slideType', slideType);
			formData.set('position', position.toString());
			formData.set('image', file);

			const response = await fetch('?/uploadSlideImage', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				// Invalidate cache to refresh data
				await invalidateAll();
				console.log('Slide image uploaded successfully');
			} else {
				console.error('Failed to upload slide image');
			}
		} catch (error) {
			console.error('Error uploading slide image:', error);
		}
 	}

	async function handleSlideRemove(event: CustomEvent<{ slideType: string; position: number }>) {
		const { slideType, position } = event.detail;
		console.log(`Removing image from slide ${slideType}, position ${position}`);

		try {
			const formData = new FormData();
			formData.set('slideType', slideType);
			formData.set('position', position.toString());

			const response = await fetch('?/removeSlideImage', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				// Invalidate cache to refresh data
				await invalidateAll();
				console.log('Slide image removed successfully');
			} else {
				console.error('Failed to remove slide image');
			}
		} catch (error) {
			console.error('Error removing slide image:', error);
		}
 	}

	function handleCreateSlideShow() {
		console.log('ProfilePage: handleCreateSlideShow called');
		console.log('ProfilePage: Creating new slide show - form submission triggered');

		if (createSlideShowForm) {
			console.log('ProfilePage: Found form, submitting...');
			isCreatingSlideShow = true;
			createSlideShowForm.requestSubmit();
			console.log('ProfilePage: Form submission requested');
		} else {
			console.error('ProfilePage: Create slide show form not found');
		}
	}
</script>

<div class="min-h-screen bg-gray-100">
	

	<!-- Main content area -->
	<div class="max-w-7xl mx-auto px-6 py-8">
		<!-- Profile Header Section -->
		<div class="flex items-start space-x-8 mb-8">
			<!-- Profile Image -->
			<div class="relative">
				<Avatar.Root class="h-32 w-32">
					<Avatar.Image
						src={profilePhotoPreview || data.providerProfile?.photoUrl || ""}
						alt="Profile"
						class="object-cover"
					/>
					<Avatar.Fallback class="text-4xl font-light bg-gray-200 text-black">
						{data.providerProfile?.firstname?.[0] || "P"}{data.providerProfile?.lastname?.[0] || ""}
					</Avatar.Fallback>
				</Avatar.Root>
			</div>

			<!-- Profile Info and Actions -->
			<div class="flex-1">
				<h1 class="text-5xl font-light text-black mb-4">
					{data.providerProfile?.firstname || "Provider"} {data.providerProfile?.lastname || "Name"}
				</h1>

				<!-- Action Buttons -->
				<div class="flex space-x-4 mb-8">
					<button class="bg-gray-200 hover:bg-gray-300 text-black px-6 py-2 rounded text-sm font-medium transition-colors">
						View Profile Slide
					</button>
					<button  class="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded text-sm font-medium transition-colors">
						Save Changes
					</button>
				</div>

				<!-- Tab Navigation -->
				<div class="flex space-x-8 border-b border-gray-300">
					<button
						onclick={() => activeTab = "profile"}
						class="pb-3 border-b-2 font-medium text-sm {activeTab === 'profile'
							? 'border-black text-black'
							: 'border-transparent text-gray-500 hover:text-black'}"
					>
						Provider Profile
					</button>
					<button
						onclick={() => activeTab = "slides"}
						class="pb-3 border-b-2 font-medium text-sm {activeTab === 'slides'
							? 'border-black text-black'
							: 'border-transparent text-gray-500 hover:text-black'}"
					>
						Slide Gallery
					</button>
				</div>
			</div>
		</div>

		<!-- Hidden photo upload form -->
		<form
			bind:this={photoForm}
			method="POST"
			action="?/uploadProfilePhoto"
			enctype="multipart/form-data"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === "success") {
						await invalidateAll();
					}
					update();
				};
			}}
			class="hidden"
		>
			<input
				bind:this={profilePhotoInput}
				type="file"
				name="photo"
				accept="image/*"
				onchange={handlePhotoChange}
			/>
		</form>

		<!-- Hidden create slide show form -->
		<form
			bind:this={createSlideShowForm}
			method="POST"
			action="?/createSlideShow"
			use:enhance={() => {
				console.log('Create slide show form enhance triggered');
				return async ({ result, update }) => {
					console.log('Create slide show result:', result);
					isCreatingSlideShow = false;

					if (result.type === "success") {
						console.log('Slide show created successfully, invalidating cache');
						await invalidateAll();
					} else if (result.type === "failure") {
						console.error('Failed to create slide show:', result.data?.error);
					}
					update();
				};
			}}
			class="hidden"
		>
		</form>

		<!-- Tab Content -->
		<div class="grid grid-cols-12 gap-8 mt-8">
			{#if activeTab === "profile"}
				<!-- Left Column - Basic Information -->
				<div class="col-span-4">
					<h3 class="text-lg font-medium text-black mb-6">Basic Information</h3>

					<form
						bind:this={profileForm}
						method="POST"
						action="?/updateProfile"
						use:enhance={() => {
							return async ({ result, update }) => {
								if (result.type === "success") {
									await invalidateAll();
								}
								update();
							};
						}}
						class="space-y-6"
					>
						<!-- Email -->
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
							<input
								name="email"
								type="email"
								value={data.form?.data?.email || data.providerProfile?.email || ""}
								placeholder="provider@example.com"
								class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
								oninput={() => {
									if (profileForm) {
										debouncedSave(profileForm);
									}
								}}
							/>
						</div>

						<!-- Set a new profile photo -->
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Set a new profile photo</label>
							<button
								type="button"
								onclick={triggerPhotoUpload}
								class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
							>
								Choose File | No file chosen
							</button>
						</div>

						<!-- Name -->
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Preferred Name</label>
							<input
								name="firstname"
								value={data.form?.data?.firstname || data.providerProfile?.firstname || ""}
								placeholder="First Name"
								class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black mb-3"
								oninput={() => {
									if (profileForm) {
										debouncedSave(profileForm);
									}
								}}
							/>
							<input
								name="lastname"
								value={data.form?.data?.lastname || data.providerProfile?.lastname || ""}
								placeholder="Last Name"
								class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
								oninput={() => {
									if (profileForm) {
										debouncedSave(profileForm);
									}
								}}
							/>
						</div>

						<!-- Bio -->
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Bio</label>
							<textarea
								name="bio"
								value={data.form?.data?.bio || data.providerProfile?.bio || ""}
								placeholder="Tell patients about yourself, your experience, and your approach to dental care..."
								rows={5}
								class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-none"
								oninput={() => {
									if (profileForm) {
										debouncedSave(profileForm);
									}
								}}
							></textarea>
						</div>

						<!-- Specialty -->
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
							<input
								name="specialty"
								value={data.form?.data?.specialty || data.providerProfile?.specialty || ""}
								placeholder="e.g., General Dentistry"
								class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
								oninput={() => {
									if (profileForm) {
										debouncedSave(profileForm);
									}
								}}
							/>
						</div>
					</form>
				</div>

				<!-- Right Column - Provider Information -->
				<div class="col-span-8">
					<h3 class="text-lg font-medium text-black mb-6">Provider Information</h3>

					<div class="space-y-6">
						<!-- Credentials -->
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Credentials</label>
							<select class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black">
								<option>{data.providerProfile?.credentials || "DDS"}</option>
								<option>DMD</option>
								<option>PhD</option>
								<option>DDS, PhD</option>
							</select>
						</div>

						<!-- Practice Type -->
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Practice Type</label>
							<div class="space-y-2">
								<div class="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
									<label class="flex items-center space-x-2 text-sm">
										<input type="checkbox" class="rounded" />
										<span>General Dentistry</span>
									</label>
									<label class="flex items-center space-x-2 text-sm">
										<input type="checkbox" class="rounded" />
										<span>Orthodontics</span>
									</label>
									<label class="flex items-center space-x-2 text-sm">
										<input type="checkbox" class="rounded" />
										<span>Periodontics</span>
									</label>
									<label class="flex items-center space-x-2 text-sm">
										<input type="checkbox" class="rounded" />
										<span>Endodontics</span>
									</label>
									<label class="flex items-center space-x-2 text-sm">
										<input type="checkbox" class="rounded" />
										<span>Oral Surgery</span>
									</label>
									<label class="flex items-center space-x-2 text-sm">
										<input type="checkbox" class="rounded" />
										<span>Prosthodontics</span>
									</label>
								</div>
							</div>
						</div>

 						 
					</div>
				</div>
			{:else}
				<!-- Slide Gallery -->
				<div class="col-span-12">
					<SlideGallery
						slideData={data.slideData}
						hasExistingPresentation={data.hasExistingPresentation}
						isCreatingSlideShow={isCreatingSlideShow}
						on:upload={handleSlideUpload}
						on:remove={handleSlideRemove}
						on:createSlideShow={handleCreateSlideShow}
					/>
				</div>
			{/if}
		</div>
	</div>
</div>