<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import { onMount } from "svelte";
  import { invalidateAll } from "$app/navigation";
  import { supabase } from "$lib/supabase";
 
  let { children } = $props();
  import "../app.css";

  
  onMount(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      console.log("Auth state change detected");
      invalidateAll();
    });

    return () => {
      subscription.unsubscribe();
    };
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
