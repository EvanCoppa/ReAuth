<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import SlideDropZone from './SlideDropZone.svelte';

	interface SlideImage {
		id: number;
		url: string | null;
	}

	interface Props {
		slideId: string;
		title: string;
		imageCount: number;
		images?: SlideImage[];
	}

	let { slideId, title, imageCount, images = [] }: Props = $props();

	const dispatch = createEventDispatcher<{
		upload: { slideId: string; dropIndex: number; file: File };
		remove: { slideId: string; dropIndex: number };
	}>();

	// Ensure we have the right number of image slots
	let slideImages = $state<SlideImage[]>([]);

	$effect(() => {
		slideImages = Array.from({ length: imageCount }, (_, index) => {
			const existing = images.find(img => img.id === index);
			return existing || { id: index, url: null };
		});
	});

	function handleUpload(event: CustomEvent<{ slideId: string; dropIndex: number; file: File }>) {
		const { dropIndex, file } = event.detail;

		// Create object URL for preview
		const imageUrl = URL.createObjectURL(file);

		// Update the image in the array
		slideImages[dropIndex] = { id: dropIndex, url: imageUrl };

		// Forward the event
		dispatch('upload', event.detail);
	}

	function handleRemove(event: CustomEvent<{ slideId: string; dropIndex: number }>) {
		const { dropIndex } = event.detail;

		// Clear the image
		if (slideImages[dropIndex]?.url) {
			URL.revokeObjectURL(slideImages[dropIndex].url!);
		}
		slideImages[dropIndex] = { id: dropIndex, url: null };

		// Forward the event
		dispatch('remove', event.detail);
	}
</script>

<div class="mb-8">
	<!-- Section Header -->
	<h4 class="text-lg font-medium text-black mb-4">{title}</h4>

	<!-- Image Grid -->
	<div class="grid grid-cols-4 gap-4">
		{#each slideImages as slideImage, index (slideImage.id)}
			<SlideDropZone
				{slideId}
				dropIndex={index}
				image={slideImage.url}
				title={`${title} - Image ${index + 1}`}
				on:upload={handleUpload}
				on:remove={handleRemove}
			/>
		{/each}
	</div>
</div>