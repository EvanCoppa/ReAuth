<script lang="ts">
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { useSidebar } from "$lib/components/ui/sidebar/index.js";
	import BadgeCheckIcon from "@lucide/svelte/icons/badge-check";
	import BellIcon from "@lucide/svelte/icons/bell";
	import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
	import CreditCardIcon from "@lucide/svelte/icons/credit-card";
	import LogOutIcon from "@lucide/svelte/icons/log-out";
	import SparklesIcon from "@lucide/svelte/icons/sparkles";
 	import { goto } from "$app/navigation";
	import { enhance } from '$app/forms';

	type UserData = {
		id: string;
		email: string;
		firstName: string;
		lastName: string;
		fullName: string;
		pending: boolean;
	} | null;

	let { userData }: { userData: UserData } = $props();

	// Function to generate initials from user data
	function getInitials(user: UserData): string {
		if (!user) return 'U';

		if (user.firstName && user.lastName) {
			return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
		}

		if (user.firstName) {
			return user.firstName.charAt(0).toUpperCase();
		}

		if (user.email) {
			return user.email.charAt(0).toUpperCase();
		}

		return 'U';
	}

	// Get display name from user data
	function getDisplayName(user: UserData): string {
		if (!user) return 'User';

		if (user.fullName && user.fullName.trim()) {
			return user.fullName;
		}

		if (user.firstName && user.lastName) {
			return `${user.firstName} ${user.lastName}`;
		}

		if (user.firstName) {
			return user.firstName;
		}

		if (user.email) {
			return user.email.split('@')[0];
		}

		return 'User';
	}


	const sidebar = useSidebar();
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						{...props}
					>
						<Avatar.Root class="size-8 rounded-lg">
							<Avatar.Image src="" alt={getDisplayName(userData)} />
							<Avatar.Fallback class="rounded-lg">{getInitials(userData)}</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-medium">{getDisplayName(userData)}</span>
							<span class="truncate text-xs">{userData?.email || ''}</span>
						</div>
						<ChevronsUpDownIcon class="ml-auto size-4" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
				side={sidebar.isMobile ? "bottom" : "right"}
				align="end"
				sideOffset={4}
			>
				<DropdownMenu.Label class="p-0 font-normal">
					<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<Avatar.Root class="size-8 rounded-lg">
							<Avatar.Image src="" alt={getDisplayName(userData)} />
							<Avatar.Fallback class="rounded-lg">{getInitials(userData)}</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-medium">{getDisplayName(userData)}</span>
							<span class="truncate text-xs">{userData?.email || ''}</span>
						</div>
					</div>
				</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item class="text-gray-400 cursor-not-allowed" disabled>
						<SparklesIcon />
						Upgrade to Pro
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item class="text-gray-400 cursor-not-allowed" disabled>
						<BadgeCheckIcon />
						Account
					</DropdownMenu.Item>
					<DropdownMenu.Item class="text-gray-400 cursor-not-allowed" disabled>
						<CreditCardIcon />
						Billing
					</DropdownMenu.Item>
					<DropdownMenu.Item class="text-gray-400 cursor-not-allowed" disabled>
						<BellIcon />
						Notifications
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<form
					method="POST"
					action="/?/logout"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success' && result.data?.redirectTo) {
								await goto(result.data.redirectTo);
							} else if (result.type === 'success') {
								await goto('/login');
							}
						};
					}}
				>
					<DropdownMenu.Item onclick={(e) => {
						e.preventDefault();
						e.currentTarget.closest('form')?.requestSubmit();
					}}>
						<LogOutIcon />
						Log out
					</DropdownMenu.Item>
				</form>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
