<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
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
			console.log('Submitting feedback:', feedbackText);
			
			await new Promise(resolve => setTimeout(resolve, 500));
			
			feedbackText = '';
			isOpen = false;
			isSubmitting = false;
		} catch (error) {
			console.error('Failed to submit feedback:', error);
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

<div class="fixed bottom-4 right-4 z-50">
	{#if isOpen}
		<div
			class="mb-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 w-80"
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

	<Button
		onclick={toggleMenu}
		class="rounded-full h-12 w-12 shadow-lg hover:shadow-xl transition-shadow duration-200"
		variant="default"
		size="icon"
	>
		<MessageCircleIcon class="h-5 w-5" />
		<span class="sr-only">Open feedback menu</span>
	</Button>
</div>