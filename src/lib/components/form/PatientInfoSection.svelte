<script lang="ts">
  interface Provider {
    id: number;
    name: string;
  }
  
  export let name: string = "";
  export let selectedDr: string = "";
  export let providers: Provider[] = [];
  export let useCustomDoctor: boolean = false;
  export let selectedProviderId: number | null = null;
  
  function toggleCustomDoctor() {
    useCustomDoctor = !useCustomDoctor;
    if (useCustomDoctor) {
      selectedProviderId = null;
    } else {
      selectedProviderId = providers[0]?.id ?? null;
    }
  }
  
  // Reactive statement to update selectedDr when provider changes
  $: if (!useCustomDoctor && selectedProviderId !== null) {
    selectedDr = providers.find(p => p.id === selectedProviderId)?.name || "";
  }
</script>

<div class="space-y-2 flex flex-col md:flex-row gap-8">
  <label class="block text-gray-700 font-semibold md:w-1/2">
    Name:
    <input
      type="text"
      placeholder="Enter patient name"
      bind:value={name}
      required
      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus-visible:border-blue-500/70 focus-visible:ring-blue-500/65 focus-visible:ring-[1.5px]"
    />
  </label>

  <label class="block text-gray-700 font-semibold md:w-1/2">
    Doctor:
    <div class="flex items-center">
      {#if useCustomDoctor}
        <input
          type="text"
          placeholder="Enter doctor name"
          bind:value={selectedDr}
          class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus-visible:border-blue-500/70 focus-visible:ring-blue-500/65 focus-visible:ring-[1.5px]"
        />
        <button
          type="button"
          class="ml-2 mt-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          on:click={toggleCustomDoctor}
        >
          Cancel
        </button>
      {:else}
        <select 
          bind:value={selectedProviderId} 
          class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus-visible:border-blue-500/70 focus-visible:ring-blue-500/65 focus-visible:ring-[1.5px]"
        >
          {#each providers as dr}
            <option value={dr.id}>{dr.name}</option>
          {/each}
        </select>
        <button
          type="button"
          class="ml-2 mt-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          on:click={toggleCustomDoctor}
        >
          Custom
        </button>
      {/if}
    </div>
  </label>
</div>