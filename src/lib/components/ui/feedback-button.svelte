<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import Button from '$lib/components/ui/button/button.svelte';
	import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
	import XIcon from '@lucide/svelte/icons/x';
	import SendIcon from '@lucide/svelte/icons/send';

	let isOpen = $state(false);
	let feedbackText = $state('');
	let isSubmitting = $state(false);

	function toggleMenu() {
		isOpen = !isOpen;
		if (!isOpen) {
			feedbackText = '';
		}
	}


	async function submitFeedback() {
		if (!feedbackText.trim() || isSubmitting) return;

		isSubmitting = true;

		try {
			const formData = new FormData();
			formData.append('message', feedbackText.trim());

			const response = await fetch('/api/feedback', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
			}

			console.log('Feedback submitted successfully:', result);

			feedbackText = '';
			isOpen = false;
		} catch (error) {
			console.error('Failed to submit feedback:', error);
			// TODO: Show error toast notification
		} finally {
			isSubmitting = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			submitFeedback();
		}
	}
</script>

<div class="relative">
	<Button
		variant="ghost"
		size="sm"
		onclick={toggleMenu}
		class="gap-2 text-sm"
	>
		<MessageCircleIcon class="h-4 w-4" />
		Feedback
	</Button>

	{#if isOpen}
		<div
			class="absolute top-full right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 w-80 z-50"
			transition:slide={{ duration: 300, easing: quintOut, axis: 'y' }}
		>
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">Send Feedback</h3>
				<Button
					variant="ghost"
					size="icon"
					class="h-6 w-6"
					onclick={toggleMenu}
				>
					<XIcon class="h-4 w-4" />
				</Button>
			</div>
			
			<div class="space-y-3">
				<textarea
					bind:value={feedbackText}
					onkeydown={handleKeydown}
					placeholder="Tell us what you think or report an issue..."
					class="w-full min-h-[80px] resize-none border-input bg-background selection:bg-primary dark:bg-input/30 selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground shadow-xs rounded-md border px-3 py-2 text-sm outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
					rows="3"
					disabled={isSubmitting}
				></textarea>

				<div class="flex justify-end">
					<Button
						onclick={submitFeedback}
						disabled={!feedbackText.trim() || isSubmitting}
						size="sm"
						class="gap-2"
					>
						{#if isSubmitting}
							<div class="animate-spin h-3 w-3 border border-white/30 border-t-white rounded-full"></div>
							Sending...
						{:else}
							<SendIcon class="h-3 w-3" />
							Send Feedback
						{/if}
					</Button>
				</div>
			</div>
		</div>
	{/if}
</div>