<script lang="ts">
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;
    let UserInfo = JSON.stringify(data.user, null, 2)

</script>

<h1>Welcome to SvelteKit</h1>

{#if data.user}
	<div>
		<h2>User Information:</h2>
		<!-- <pre>{UserInfo}</pre> -->

		<form method="POST" action="?/logout">
			<button type="submit">Logout</button>
		</form>

		<form method="POST" action="?/testProfiles">
			<button type="submit">Test Fetch Profiles</button>
		</form>

		<form method="POST" action="?/getUser">
			<button type="submit">Get Current User</button>
		</form>

		{#if form?.success !== undefined}
			<div style="margin-top: 20px; padding: 10px; border: 1px solid #ccc; background: #f9f9f9;">
				<h3>Get User Results:</h3>
				{#if form.success}
					<p><strong>Success:</strong> User data retrieved</p>
					<pre>{JSON.stringify(form.user, null, 2)}</pre>
					{#if form.error}
						<p><strong>Note:</strong> {JSON.stringify(form.error, null, 2)}</p>
					{/if}
				{:else}
					<p><strong>Error:</strong> {form.error}</p>
				{/if}
			</div>
		{/if}
	</div>
{:else}
	<p>No user logged in</p>
{/if}


<a href="/login">Login</a>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
