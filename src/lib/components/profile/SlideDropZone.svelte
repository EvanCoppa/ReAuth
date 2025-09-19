<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import X from "@lucide/svelte/icons/x";
	import Upload from "@lucide/svelte/icons/upload";

	interface Props {
		image?: string | null;
		slideId: string;
		dropIndex: number;
		title?: string;
	}

	let { image = null, slideId, dropIndex, title = "" }: Props = $props();

	const dispatch = createEventDispatcher<{
		upload: { slideId: string; dropIndex: number; file: File };
		remove: { slideId: string; dropIndex: number };
	}>();

	let isDragOver = $state(false);
	let fileInput: HTMLInputElement;

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragOver = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		isDragOver = false;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragOver = false;

		const files = event.dataTransfer?.files;
		if (files && files.length > 0) {
			const file = files[0];
			if (file.type.startsWith('image/')) {
				dispatch('upload', { slideId, dropIndex, file });
			}
		}
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			dispatch('upload', { slideId, dropIndex, file });
		}
	}

	function handleRemove(event: Event) {
		event.stopPropagation(); // Prevent the click from bubbling up
		dispatch('remove', { slideId, dropIndex });
	}

	function triggerFileSelect() {
		fileInput?.click();
	}
</script>

<div class="relative group">
	{#if image}
		<!-- Image preview -->
		<div
			class="w-full aspect-square bg-white border-2 border-gray-300 rounded-lg overflow-hidden relative cursor-pointer hover:border-gray-400 transition-colors"
			onclick={triggerFileSelect}
		>
			<img
				src={image}
				alt={title || `Slide ${slideId} image ${dropIndex}`}
				class="w-full h-full object-cover"
			/>
			<!-- Remove button on hover -->
			<button
				onclick={handleRemove}
				class="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
				aria-label="Remove image"
			>
				<X class="h-4 w-4" />
			</button>
		</div>
	{:else}
		<!-- Drop zone -->
		<div
			class="w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer {isDragOver ? 'border-blue-500 bg-blue-50' : ''}"
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			ondrop={handleDrop}
			onclick={triggerFileSelect}
		>
			<Upload class="h-8 w-8 mb-2 text-gray-400" />
			<p class="text-sm text-center px-2">
				Drop image here or click to upload
			</p>
		</div>
	{/if}

	<!-- Hidden file input -->
	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		onchange={handleFileSelect}
		class="hidden"
	/>
</div>