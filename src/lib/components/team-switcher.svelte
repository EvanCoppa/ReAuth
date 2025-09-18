<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { useSidebar } from "$lib/components/ui/sidebar/index.js";
	import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import LogOutIcon from "@lucide/svelte/icons/log-out";
 	// Removed auth store - using cookies directly
	import { goto } from "$app/navigation";
 
	// This should be `Component` after @lucide/svelte updates types
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let { teams }: { teams: { name: string; logo: any; plan: string }[] } = $props();
	const sidebar = useSidebar();

	let activeTeam = $state(teams[0]);

	// Logout function
	async function handleLogout() {
		try {
			 
 			goto('/login');
		} catch (error) {
			console.error('Logout failed:', error);
		}
	}
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						{...props}
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						<div
							class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
						>
							<activeTeam.logo class="size-4" />
						</div>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-medium">
								{activeTeam.name}
							</span>
							<span class="truncate text-xs">{activeTeam.plan}</span>
						</div>
						<ChevronsUpDownIcon class="ml-auto" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
				align="start"
				side={sidebar.isMobile ? "bottom" : "right"}
				sideOffset={4}
			>
				<DropdownMenu.Label class="text-muted-foreground text-xs">Teams</DropdownMenu.Label>
				{#each teams as team, index (team.name)}
					<DropdownMenu.Item onSelect={() => (activeTeam = team)} class="gap-2 p-2">
						<div class="flex size-6 items-center justify-center rounded-md border">
							<team.logo class="size-3.5 shrink-0" />
						</div>
						{team.name}
						<DropdownMenu.Shortcut>⌘{index + 1}</DropdownMenu.Shortcut>
					</DropdownMenu.Item>
				{/each}
				<DropdownMenu.Separator />
				<DropdownMenu.Item class="gap-2 p-2 text-gray-400 cursor-not-allowed pointer-events-none">
					<div
						class="flex size-6 items-center justify-center rounded-md border bg-transparent"
					>
						<PlusIcon class="size-4 text-gray-400" />
					</div>
					<div class="text-gray-400 font-medium">Add team</div>
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item onclick={handleLogout} class="gap-2 p-2">
					<div class="flex size-6 items-center justify-center rounded-md border">
						<LogOutIcon class="size-3.5 shrink-0" />
					</div>
					Log out
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
