<script lang="ts">
  import type { TreatmentItem } from "$lib/types";
  
  interface Props {
    allTreatmentItems?: TreatmentItem[];
    selectedCodes?: string[];
    onItemAdd: (item: TreatmentItem) => void;
    onItemRemove: (code: string) => void;
  }
  
  let { 
    allTreatmentItems = [], 
    selectedCodes = [], 
    onItemAdd,
    onItemRemove 
  }: Props = $props();

  let searchInput = $state("");
  let searchResults = $state<TreatmentItem[]>([]);
  
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
  
  function handleItemSelect(item: TreatmentItem) {
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
  <div class="flex flex-col gap-2 items-start">
    <div class="flex-1">
      <input
        type="text"
        placeholder="Search code or name"
        bind:value={searchInput}
        oninput={updateSearchResults}
        onkeydown={handleKeydown}
        class="border border-gray-300 rounded-md px-2 py-1 w-[500px]"
      />
      {#if searchResults.length > 0}
        <ul class="absolute z-10 bg-white border border-gray-200 rounded-md mt-1 w-full max-h-40 overflow-auto shadow">
          {#each searchResults as result}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <li 
              class="px-2 py-1 hover:bg-blue-100 cursor-pointer" 
              onclick={() => handleItemSelect(result)}
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
            onclick={() => handleRemoveCode(code)}
            aria-label="Remove code"
          >
            ×
          </button>
        </span>
      {/each}
    </div>
  </div>
</div>

