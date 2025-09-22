<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import SlideSection from './SlideSection.svelte';

	interface SlideImage {
		id: number;
		element_order: number;
		image_url: string;
		alt_text?: string;
	}

	interface SlideConfig {
		id: string;
		title: string;
		imageCount: number;
		images: SlideImage[];
	}

	interface Props {
		slideData?: Record<string, { slideId: number; images: SlideImage[] }>;
		hasExistingPresentation?: boolean;
		isCreatingSlideShow?: boolean;
	}

	let { slideData = {}, hasExistingPresentation = false, isCreatingSlideShow = false }: Props = $props();

	const dispatch = createEventDispatcher<{
		upload: { slideType: string; position: number; file: File };
		remove: { slideType: string; position: number };
		createSlideShow: {};
	}>();

	// Slide type mappings from schema ENUM to UI display
	const slideTypeConfigs = {
		title: { title: 'Welcome/Title Slide', imageCount: 2 },
		education: { title: 'Treatment Process', imageCount: 4 },
		services: { title: 'Smile Gallery', imageCount: 6 },
		about: { title: 'Office Tour', imageCount: 3 },
		pricing: { title: 'Pricing Information', imageCount: 2 },
		contact: { title: 'Contact Information', imageCount: 1 }
	};

	let slideConfigs = $state<SlideConfig[]>([]);

	$effect(() => {
		// Generate slide configs from schema types and existing data
		slideConfigs = Object.entries(slideTypeConfigs).map(([slideType, config]) => {
			const existingData = slideData[slideType];

			// Create array of images with proper positioning (filter only image elements)
			const images: SlideImage[] = [];
			if (existingData?.images) {
				// Filter to only image elements and fill in at their positions
				const imageElements = existingData.images.filter((element: any) => element.element_type === 'image');
				for (const img of imageElements) {
					images[img.element_order] = img;
				}
			}

			return {
				id: slideType,
				title: config.title,
				imageCount: config.imageCount,
				images
			};
		});
	});

	function handleUpload(event: CustomEvent<{ slideId: string; dropIndex: number; file: File }>) {
		const { slideId, dropIndex, file } = event.detail;
		// Forward with new format
		dispatch('upload', {
			slideType: slideId,
			position: dropIndex,
			file
		});
	}

	function handleRemove(event: CustomEvent<{ slideId: string; dropIndex: number }>) {
		const { slideId, dropIndex } = event.detail;
		// Forward with new format
		dispatch('remove', {
			slideType: slideId,
			position: dropIndex
		});
	}

	function createSlideShow() {
		console.log('SlideGallery: createSlideShow button clicked');
		dispatch('createSlideShow', {});
		console.log('SlideGallery: createSlideShow event dispatched');
	}
</script>

<div class="space-y-8">
	<div class="mb-6">
		<h3 class="text-lg font-medium text-black mb-2">Digital Slides</h3>
		<p class="text-sm text-gray-600">Upload images for your slide presentations. Each section represents a different type of slide.</p>
	</div>

	{#if !hasExistingPresentation}
		<!-- Create Slide Show Prompt -->
		<div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
			<div class="mb-4">
				<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
			</div>
			<h4 class="text-lg font-medium text-black mb-2">Create Your First Slide Show</h4>
			<p class="text-gray-600 mb-4">Get started by creating a slide presentation to upload your images.</p>
			<button
				onclick={createSlideShow}
				disabled={isCreatingSlideShow}
				class="bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2"
			>
				{#if isCreatingSlideShow}
					<svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Creating...
				{:else}
					Create Slide Show
				{/if}
			</button>
		</div>
	{:else}
		<!-- Slide Upload Sections -->
		{#each slideConfigs as slide (slide.id)}
			<SlideSection
				slideId={slide.id}
				title={slide.title}
				imageCount={slide.imageCount}
				images={slide.images}
				on:upload={handleUpload}
				on:remove={handleRemove}
			/>
		{/each}
	{/if}
</div>