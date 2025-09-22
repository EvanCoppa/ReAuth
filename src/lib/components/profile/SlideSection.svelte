<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import SlideDropZone from './SlideDropZone.svelte';

	interface SlideImage {
		id: number;
		element_order: number;
		image_url: string;
		alt_text?: string;
	}

	interface DisplayImage {
		position: number;
		url: string | null;
	}

	interface Props {
		slideId: string;
		title: string;
		imageCount: number;
		images: SlideImage[];
	}

	let { slideId, title, imageCount, images = [] }: Props = $props();

	const dispatch = createEventDispatcher<{
		upload: { slideId: string; dropIndex: number; file: File };
		remove: { slideId: string; dropIndex: number };
	}>();

	// Ensure we have the right number of image slots with positioned images
	let displayImages = $state<DisplayImage[]>([]);

	$effect(() => {
		displayImages = Array.from({ length: imageCount }, (_, index) => {
			// Find existing image at this position
			const existingImage = images.find(img => img.element_order === index);
			return {
				position: index,
				url: existingImage?.image_url || null
			};
		});
	});

	function handleUpload(event: CustomEvent<{ slideId: string; dropIndex: number; file: File }>) {
		const { dropIndex, file } = event.detail;

		// Create object URL for immediate preview
		const imageUrl = URL.createObjectURL(file);

		// Update the display array optimistically
		displayImages[dropIndex] = { position: dropIndex, url: imageUrl };

		// Forward the event
		dispatch('upload', event.detail);
	}

	function handleRemove(event: CustomEvent<{ slideId: string; dropIndex: number }>) {
		const { dropIndex } = event.detail;

		// Clear the image from display
		if (displayImages[dropIndex]?.url) {
			// Only revoke if it's a blob URL (preview), not a server URL
			if (displayImages[dropIndex].url!.startsWith('blob:')) {
				URL.revokeObjectURL(displayImages[dropIndex].url!);
			}
		}
		displayImages[dropIndex] = { position: dropIndex, url: null };

		// Forward the event
		dispatch('remove', event.detail);
	}
</script>

<div class="mb-8">
	<!-- Section Header -->
	<h4 class="text-lg font-medium text-black mb-4">{title}</h4>

	<!-- Image Grid -->
	<div class="grid grid-cols-4 gap-4">
		{#each displayImages as displayImage, index (displayImage.position)}
			<SlideDropZone
				{slideId}
				dropIndex={index}
				image={displayImage.url}
				title={`${title} - Image ${index + 1}`}
				on:upload={handleUpload}
				on:remove={handleRemove}
			/>
		{/each}
	</div>
</div>