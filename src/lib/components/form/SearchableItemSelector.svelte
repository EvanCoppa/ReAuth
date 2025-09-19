<script lang="ts">
  export let allTreatmentItems: { name: string; cost: number; code: string }[] = [];
  export let selectedCodes: string[] = [];
  export let onItemAdd: (item: { name: string; cost: number; code: string }) => void;
  export let onItemRemove: (code: string) => void;
  
  let searchInput = "";
  let searchResults: { name: string; cost: number; code: string }[] = [];
  
  function updateSearchResults() {
    const query = searchInput.toLowerCase().trim();
    if (!query) {
      searchResults = [];
      return;
    }
    searchResults = allTreatmentItems
      .filter(item => 
        item.code.toLowerCase().includes(query) || 
        item.name.toLowerCase().includes(query)
      )
      .slice(0, 5);
  }
  
  function handleItemSelect(item: { name: string; cost: number; code: string }) {
    onItemAdd(item);
    searchInput = "";
    searchResults = [];
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && searchInput.trim()) {
      e.preventDefault();
      const code = searchInput.trim();
      const item = allTreatmentItems.find(i => i.code.toLowerCase() === code.toLowerCase());
      if (item) {
        handleItemSelect(item);
      }
    }
  }
  
  function handleRemoveCode(code: string) {
    onItemRemove(code);
  }
</script>

<div class="flex flex-col gap-2 relative">
  <label class="text-gray-600 font-medium">Add by Code or Name:</label>
  <div class="flex gap-2 items-start">
    <div class="flex-1">
      <input
        type="text"
        placeholder="Search code or name"
        bind:value={searchInput}
        on:input={updateSearchResults}
        on:keydown={handleKeydown}
        class="border border-gray-300 rounded-md px-2 py-1 w-full"
      />
      {#if searchResults.length > 0}
        <ul class="absolute z-10 bg-white border border-gray-200 rounded-md mt-1 w-full max-h-40 overflow-auto shadow">
          {#each searchResults as result}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <li 
              class="px-2 py-1 hover:bg-blue-100 cursor-pointer" 
              on:click={() => handleItemSelect(result)}
            >
              {result.code} - {result.name}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    <div class="flex gap-1 flex-wrap">
      {#each selectedCodes as code}
        <span class="bg-gray-100 rounded-sm px-2 py-0.5 flex items-center text-sm">
          {code}
          <button
            type="button"
            class="ml-1 text-blue-500 hover:text-blue-700"
            on:click={() => handleRemoveCode(code)}
            aria-label="Remove code"
          >
            ×
          </button>
        </span>
      {/each}
    </div>
  </div>
</div>