<script lang="ts">
  import type { PageData } from "./$types";
  import NewFormPage from "$lib/components/new-form/NewFormPage.svelte";

  let { data }: { data: PageData } = $props();
</script>

<NewFormPage {data} />

