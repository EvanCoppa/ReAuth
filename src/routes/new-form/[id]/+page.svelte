<script lang="ts">
  import type { PageData } from './$types';
  import NewFormPage from '$lib/components/new-form/NewFormPage.svelte';

  let { data }: { data: PageData } = $props();
  console.log("Page data!!!!:", data);
</script>
<div class="flex">

<NewFormPage {data} prefillData={data.prefillData} isEditing={true} class="mx-auto" /></div>
