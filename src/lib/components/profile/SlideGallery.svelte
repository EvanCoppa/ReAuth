<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import SlideSection from './SlideSection.svelte';

	interface SlideConfig {
		id: string;
		title: string;
		imageCount: number;
		images?: { id: number; url: string | null }[];
	}

	interface Props {
		slides?: SlideConfig[];
	}

	let { slides = [] }: Props = $props();

	const dispatch = createEventDispatcher<{
		upload: { slideId: string; dropIndex: number; file: File };
		remove: { slideId: string; dropIndex: number };
	}>();

	// Default slide configurations
	let defaultSlides: SlideConfig[] = $state([
		{
			id: 'Welcome',
			title: 'Welcome',
			imageCount: 1
		},
		{
			id: 'treatment-process',
			title: 'Treatment Process',
			imageCount: 3
		},
		{
			id: 'smile-gallery',
			title: 'Smile Gallery',
			imageCount: 3
		},
		{
			id: 'office-tour',
			title: 'Office Tour',
			imageCount: 2
		}
	]);

	let slideConfigs = $state<SlideConfig[]>([]);

	$effect(() => {
		slideConfigs = slides.length > 0 ? slides : defaultSlides;
	});

	function handleUpload(event: CustomEvent<{ slideId: string; dropIndex: number; file: File }>) {
		// Forward the event to parent
		dispatch('upload', event.detail);
	}

	function handleRemove(event: CustomEvent<{ slideId: string; dropIndex: number }>) {
		// Forward the event to parent
		dispatch('remove', event.detail);
	}
</script>

<div class="space-y-8">
	<div class="mb-6">
		<h3 class="text-lg font-medium text-black mb-2">Digital Slides</h3>
		<p class="text-sm text-gray-600">Upload images for your slide presentations. Each section represents a different type of slide.</p>
	</div>

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
</div>