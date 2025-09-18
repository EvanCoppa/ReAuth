<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
    let UserInfo = JSON.stringify(data.user, null, 2)
 
</script>

<h1>Welcome to SvelteKit</h1>

{#if data.user}
	<div>
		<h2>User Information:</h2>
		<pre>{UserInfo}</pre>

		<form method="POST" action="?/logout">
			<button type="submit">Logout</button>
		</form>

		<form method="POST" action="?/testProfiles">
			<button type="submit">Test Fetch Profiles</button>
		</form>
	</div>
{:else}
	<p>No user logged in</p>
{/if}


<a href="/login">Login</a>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
