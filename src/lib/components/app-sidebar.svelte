<script lang="ts" module>
	import AudioWaveformIcon from "@lucide/svelte/icons/audio-waveform";
	import BookOpenIcon from "@lucide/svelte/icons/book-open";
	import Folder from "@lucide/svelte/icons/folder-dot";
	import ChartPieIcon from "@lucide/svelte/icons/chart-pie";
	import CommandIcon from "@lucide/svelte/icons/command";
	import FrameIcon from "@lucide/svelte/icons/frame";
	import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
	import MapIcon from "@lucide/svelte/icons/map";
	import Settings2Icon from "@lucide/svelte/icons/settings-2";
	import Book from "@lucide/svelte/icons/book-copy";
 	import PatientAdvocateLogo from "./PatientAdvocateLogo.svelte";
	// This is sample data.
	const data = {
		user: {
			name: "Evan Coppa",
			email: "evancoppa@gmail.com",
			avatar: "",
		},
		teams: [
			{
				name: "Patient Advocate",
				logo: PatientAdvocateLogo,
				plan: "Enterprise",
			},
			
		],
		navMain: [
			{
				title: "Tools",
				url: "#",
				icon: Book,
				isActive: false,
				items: [
					{
						title: "Form",
						url: "/new-form",
					},
					{
						title: "Treatment Plans",
						url: "/treatment-plans",
					},
					{
						title: "Clients",
						url: "/clients",
					},
					{
						title: "Reports",
						url: "/reports",
					},
					
				],
			},
			// {
			// 	title: "Admin",
			// 	url: "#",
			// 	icon: Folder,
			// 	items: [
			// 		{
			// 			title: "Treatment Plans",
			// 			url: "/treatment-plans",
			// 		},
			// 		{
			// 			title: "Visits",
			// 			url: "/visits",
			// 		},
			// 		{
			// 			title: "Billables",
			// 			url: "/admin/billables",
			// 		},
			// 	],
			// },
			{
				title: "Documentation",
				url: "#",
				icon: BookOpenIcon,
				items: [
					// {
					// 	title: "User Guide",
					// 	url: "/docs/user-guide",
					// },
					{
						title: "Database Schema",
						url: "/docs/database-schema",
					},
					{
						title: "Changelog",
						url: "/docs/changelog",
					},
					{
						title: "Tutorials",
						url: "#",
					},
				],
			},
			{
				title: "Settings",
				url: "#",
				icon: Settings2Icon,
				items: [
					{
						title: "Provider Profile",
						url: "/settings/profile",
					},
					{
						title: "Form Settings",
						url: "/settings/form",
					},
					{
						title: "Billables",
						url: "/settings/billables",
					},
					{
						title: "Slide Templates",
						url: "/settings/slide-templates",
					},
					{
						title: "Saved Templates",
						url: "/settings/saved-templates",
					},

				],
			},
		],
		projects: [
			// {
			// 	name: "Design Engineering",
			// 	url: "#",
			// 	icon: FrameIcon,
			// },
			// {
			// 	name: "Sales & Marketing",
			// 	url: "#",
			// 	icon: ChartPieIcon,
			// },
			// {
			// 	name: "Travel",
			// 	url: "#",
			// 	icon: MapIcon,
			// },
		],
	};
</script>

<script lang="ts">
	import NavMain from "./nav-main.svelte";
	import NavProjects from "./nav-projects.svelte";
	import NavUser from "./nav-user.svelte";
	import TeamSwitcher from "./team-switcher.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import type { ComponentProps } from "svelte";
	import { page } from "$app/state";

	let {
		ref = $bindable(null),
		collapsible = "icon",
		...restProps
	}: ComponentProps<typeof Sidebar.Root> = $props();

	// Get user data from the page state (layout data)
	let userData = $derived(page.data?.session?.userProfile || null);
</script>

<Sidebar.Root {collapsible} {...restProps}>
	<Sidebar.Header>
		<TeamSwitcher teams={data.teams} />
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
		<NavProjects projects={data.projects} />
	</Sidebar.Content>
	<Sidebar.Footer>
 			<NavUser {userData} />
 	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
