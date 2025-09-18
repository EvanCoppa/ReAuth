<script lang="ts">
	import { Input } from "$lib/components/ui/input/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/utils.js";
	import EyeIcon from "@lucide/svelte/icons/eye";
	import EyeOffIcon from "@lucide/svelte/icons/eye-off";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		value = $bindable(""),
		...restProps
	}: ComponentProps<typeof Input> & {
		value?: string;
	} = $props();

	let showPassword = $state(false);

	function togglePasswordVisibility(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		showPassword = !showPassword;
	}
</script>

<div class="relative">
	<Input
		bind:ref
		bind:value
		type={showPassword ? "text" : "password"}
		class={cn("pr-10", className)}
		{...restProps}
	/>
	<Button
		type="button"
		variant="ghost"
		size="sm"
		class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
		onclick={togglePasswordVisibility}
		tabindex={-1}
	>
		{#if showPassword}
			<EyeOffIcon class="size-4 text-muted-foreground" />
		{:else}
			<EyeIcon class="size-4 text-muted-foreground" />
		{/if}
		<span class="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
	</Button>
</div>